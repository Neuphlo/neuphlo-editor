import { Node } from "@tiptap/pm/model"
import { Editor, NodeViewWrapper } from "@tiptap/react"
import { useCallback, useRef } from "react"
import { ImageBlockMenu } from "./ImageBlockMenu"
import { ImageUploader } from "./ImageUploader"
import { ImageBlockLoading } from "./ImageBlockLoading"

interface ImageBlockViewProps {
  editor: Editor
  getPos: () => number
  node: Node
  updateAttributes: (attrs: Record<string, any>) => void
}

export const ImageBlockView = (props: ImageBlockViewProps) => {
  const { editor, getPos, node, updateAttributes } = props as ImageBlockViewProps & {
    node: Node & {
      attrs: {
        src: string
        width: string
        align: "left" | "center" | "right"
        alt?: string
        loading?: boolean
      }
    }
  }
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const { src, width, align, alt, loading } = node.attrs

  const handleUpload = useCallback(
    (url: string) => {
      updateAttributes({ src: url, loading: false })
    },
    [updateAttributes]
  )

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos())
  }, [getPos, editor.commands])

  // Calculate wrapper class based on alignment
  const getWrapperStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: width || "100%",
      maxWidth: "100%",
    }

    if (align === "left") {
      return { ...baseStyle, marginLeft: 0, marginRight: "auto" }
    } else if (align === "right") {
      return { ...baseStyle, marginLeft: "auto", marginRight: 0 }
    } else {
      return { ...baseStyle, marginLeft: "auto", marginRight: "auto" }
    }
  }

  // Show uploader if no src
  if (!src || src === "") {
    return (
      <NodeViewWrapper>
        <div style={getWrapperStyle()}>
          <div ref={imageWrapperRef}>
            <ImageUploader onUpload={handleUpload} editor={editor} />
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  // Show loading placeholder
  if (loading) {
    return (
      <NodeViewWrapper>
        <div style={getWrapperStyle()}>
          <div ref={imageWrapperRef}>
            <ImageBlockLoading />
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  // Show the actual image
  return (
    <NodeViewWrapper>
      <div style={getWrapperStyle()}>
        <div contentEditable={false} ref={imageWrapperRef} style={{ position: "relative" }}>
          <img
            src={src}
            alt={alt || ""}
            onClick={onClick}
            className="nph-image-block"
          />
        </div>
      </div>
      <ImageBlockMenu editor={editor} appendTo={imageWrapperRef} />
    </NodeViewWrapper>
  )
}

export default ImageBlockView
