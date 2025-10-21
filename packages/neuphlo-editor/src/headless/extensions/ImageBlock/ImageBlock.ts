import { mergeAttributes, Range } from "@tiptap/core"
import { Image as TiptapImage } from "@tiptap/extension-image"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { EditorView } from "@tiptap/pm/view"

export interface ImageBlockOptions {
  uploadImage?: (file: File) => Promise<string>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string }) => ReturnType
      setImageBlockAt: (attributes: {
        src: string
        pos: number | Range
      }) => ReturnType
      setImageBlockAlign: (align: "left" | "center" | "right") => ReturnType
      setImageBlockWidth: (width: number) => ReturnType
    }
  }
}

export const ImageBlock = TiptapImage.extend<ImageBlockOptions>({
  name: "imageBlock",

  group: "block",

  defining: true,

  isolating: true,

  addOptions() {
    return {
      ...this.parent?.(),
      uploadImage: undefined,
      inline: false,
    }
  },

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-width"),
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
        }),
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => ({
          alt: attributes.alt,
        }),
      },
      loading: {
        default: false,
        parseHTML: () => false,
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]:not([src^="data:"])',
        getAttrs: (element) => {
          const el = element as HTMLElement
          return {
            src: el.getAttribute("src"),
            alt: el.getAttribute("alt"),
            width: el.getAttribute("data-width") || "100%",
            align: el.getAttribute("data-align") || "center",
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      setImageBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: "imageBlock",
            attrs: { src: attrs.src },
          })
        },

      setImageBlockAt:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContentAt(attrs.pos, {
            type: "imageBlock",
            attrs: { src: attrs.src },
          })
        },

      setImageBlockAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", { align }),

      setImageBlockWidth:
        (width) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", {
            width: `${Math.max(0, Math.min(100, width))}%`,
          }),
    }
  },

  addNodeView() {
    // We'll import this dynamically to avoid circular dependencies
    // The view will be registered from the React side
    return ReactNodeViewRenderer(
      require("../../../react/menus/ImageBlock/ImageBlockView").ImageBlockView
    )
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("imageBlockDrop"),
        props: {
          handleDOMEvents: {
            drop: (view: EditorView, event: DragEvent) => {
              const hasFiles =
                event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length

              if (!hasFiles) {
                return false
              }

              const images = Array.from(event.dataTransfer.files).filter(
                (file) => /image/i.test(file.type)
              )

              if (images.length === 0) {
                return false
              }

              event.preventDefault()

              const { schema } = view.state
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })

              if (!coordinates) return false

              images.forEach(async (image) => {
                if (this.options.uploadImage) {
                  try {
                    // Insert placeholder first
                    const placeholderNode = schema.nodes.imageBlock.create({
                      src: "",
                      loading: true,
                    })
                    const placeholderTr = view.state.tr.insert(
                      coordinates.pos,
                      placeholderNode
                    )
                    view.dispatch(placeholderTr)

                    // Upload and replace
                    const url = await this.options.uploadImage(image)
                    const node = schema.nodes.imageBlock.create({ src: url })

                    // Find and replace the placeholder
                    const currentState = view.state
                    let foundPos = -1
                    currentState.doc.descendants((node, pos) => {
                      if (
                        node.type.name === "imageBlock" &&
                        node.attrs.loading
                      ) {
                        foundPos = pos
                        return false
                      }
                    })

                    if (foundPos !== -1) {
                      const transaction = view.state.tr.replaceWith(
                        foundPos,
                        foundPos + 1,
                        node
                      )
                      view.dispatch(transaction)
                    }
                  } catch (error) {
                    console.error("Failed to upload image:", error)
                    // Remove placeholder on error
                    const currentState = view.state
                    let foundPos = -1
                    currentState.doc.descendants((node, pos) => {
                      if (
                        node.type.name === "imageBlock" &&
                        node.attrs.loading
                      ) {
                        foundPos = pos
                        return false
                      }
                    })

                    if (foundPos !== -1) {
                      const transaction = view.state.tr.delete(
                        foundPos,
                        foundPos + 1
                      )
                      view.dispatch(transaction)
                    }
                  }
                }
              })

              return true
            },
            paste: (view: EditorView, event: ClipboardEvent) => {
              const hasFiles =
                event.clipboardData &&
                event.clipboardData.files &&
                event.clipboardData.files.length

              if (!hasFiles) {
                return false
              }

              const images = Array.from(event.clipboardData.files).filter(
                (file) => /image/i.test(file.type)
              )

              if (images.length === 0) {
                return false
              }

              event.preventDefault()

              images.forEach(async (image) => {
                if (this.options.uploadImage) {
                  try {
                    // Insert placeholder first
                    const placeholderNode =
                      view.state.schema.nodes.imageBlock.create({
                        src: "",
                        loading: true,
                      })
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(placeholderNode)
                    )

                    // Upload and replace
                    const url = await this.options.uploadImage(image)
                    const node = view.state.schema.nodes.imageBlock.create({
                      src: url,
                    })

                    // Find and replace the placeholder
                    const currentState = view.state
                    let foundPos = -1
                    currentState.doc.descendants((node, pos) => {
                      if (
                        node.type.name === "imageBlock" &&
                        node.attrs.loading
                      ) {
                        foundPos = pos
                        return false
                      }
                    })

                    if (foundPos !== -1) {
                      const transaction = view.state.tr.replaceWith(
                        foundPos,
                        foundPos + 1,
                        node
                      )
                      view.dispatch(transaction)
                    }
                  } catch (error) {
                    console.error("Failed to upload image:", error)
                    // Remove placeholder on error
                    const currentState = view.state
                    let foundPos = -1
                    currentState.doc.descendants((node, pos) => {
                      if (
                        node.type.name === "imageBlock" &&
                        node.attrs.loading
                      ) {
                        foundPos = pos
                        return false
                      }
                    })

                    if (foundPos !== -1) {
                      const transaction = view.state.tr.delete(
                        foundPos,
                        foundPos + 1
                      )
                      view.dispatch(transaction)
                    }
                  }
                }
              })

              return true
            },
          },
        },
      }),
    ]
  },
})

export default ImageBlock
