import { Image as TiptapImage } from "@tiptap/extension-image"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { EditorView } from "@tiptap/pm/view"

export interface ImageOptions {
  uploadImage?: (file: File) => Promise<string>
  allowBase64?: boolean
}

export const Image = TiptapImage.extend<ImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      uploadImage: undefined,
      allowBase64: false,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
      align: {
        default: "left",
        parseHTML: (element) => element.getAttribute("data-align") || "left",
        renderHTML: (attributes) => {
          return {
            "data-align": attributes.align,
          }
        },
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage:
        (options: {
          src: string
          alt?: string
          title?: string
          width?: string | number
          height?: string | number
          align?: "left" | "center" | "right"
        }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
      uploadImage:
        () =>
        ({ editor }: { editor: any }) => {
          const input = document.createElement("input")
          input.type = "file"
          input.accept = "image/*"

          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            // Check if uploadImage handler is provided
            if (this.options.uploadImage) {
              try {
                const url = await this.options.uploadImage(file)
                editor.chain().focus().setImage({ src: url }).run()
              } catch (error) {
                console.error("Failed to upload image:", error)
              }
            } else if (this.options.allowBase64) {
              // Fallback to base64 if no upload handler provided
              const reader = new FileReader()
              reader.onload = () => {
                const url = reader.result as string
                editor.chain().focus().setImage({ src: url }).run()
              }
              reader.readAsDataURL(file)
            } else {
              console.warn(
                "No upload handler provided. Please provide uploadImage option or enable allowBase64."
              )
            }
          }

          input.click()
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("imageDrop"),
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
                    const url = await this.options.uploadImage(image)
                    const node = schema.nodes.image.create({ src: url })
                    const transaction = view.state.tr.insert(
                      coordinates.pos,
                      node
                    )
                    view.dispatch(transaction)
                  } catch (error) {
                    console.error("Failed to upload image:", error)
                  }
                } else if (this.options.allowBase64) {
                  const reader = new FileReader()
                  reader.onload = (readerEvent) => {
                    const node = schema.nodes.image.create({
                      src: readerEvent.target?.result,
                    })
                    const transaction = view.state.tr.insert(
                      coordinates.pos,
                      node
                    )
                    view.dispatch(transaction)
                  }
                  reader.readAsDataURL(image)
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
                    const url = await this.options.uploadImage(image)
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.image.create({ src: url })
                      )
                    )
                  } catch (error) {
                    console.error("Failed to upload image:", error)
                  }
                } else if (this.options.allowBase64) {
                  const reader = new FileReader()
                  reader.onload = (readerEvent) => {
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.image.create({
                          src: readerEvent.target?.result,
                        })
                      )
                    )
                  }
                  reader.readAsDataURL(image)
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

export default Image
