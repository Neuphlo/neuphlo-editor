import { mergeAttributes, Node } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"

export interface VideoBlockOptions {
  nodeView?: any
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoBlock: {
      setVideoBlock: (attributes: { src: string }) => ReturnType
      setVideoBlockAlign: (align: "left" | "center" | "right") => ReturnType
      setVideoBlockWidth: (width: number) => ReturnType
    }
  }
}

export const VideoBlock = Node.create<VideoBlockOptions>({
  name: "videoBlock",

  group: "block",

  defining: true,

  isolating: true,

  atom: true,

  addOptions() {
    return {
      nodeView: undefined,
    }
  },

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-src"),
        renderHTML: (attributes) => ({
          "data-src": attributes.src,
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
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "video-block" }),
    ]
  },

  addCommands() {
    return {
      setVideoBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: "videoBlock",
            attrs: { src: attrs.src },
          })
        },

      setVideoBlockAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes("videoBlock", { align }),

      setVideoBlockWidth:
        (width) =>
        ({ commands }) =>
          commands.updateAttributes("videoBlock", {
            width: `${Math.max(0, Math.min(100, width))}%`,
          }),
    }
  },

  addNodeView() {
    if (this.options.nodeView) {
      return ReactNodeViewRenderer(this.options.nodeView)
    }
    return undefined as any
  },
})

export default VideoBlock
