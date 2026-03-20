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
  // Uses max-width for the percentage so the wrapper shrinks to fit the image
  const getWrapperStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: "fit-content",
      maxWidth: width || "100%",
    }

    if (align === "left") {
      return { ...baseStyle, marginLeft: 0, marginRight: "auto" }
    } else if (align === "right") {
      return { ...baseStyle, marginLeft: "auto", marginRight: 0 }
    } else {
      return { ...baseStyle, marginLeft: "auto", marginRight: "auto" }
    }
  }

  // The inner content wrapper for positioning the menu
  const getContentStyle = (): React.CSSProperties => ({
    position: "relative" as const,
  })

  // Show uploader if no src
  if (!src || src === "") {
    return (
      <NodeViewWrapper style={getWrapperStyle()}>
        <div ref={imageWrapperRef}>
          <ImageUploader onUpload={handleUpload} editor={editor} />
        </div>
      </NodeViewWrapper>
    )
  }

  // Show loading placeholder
  if (loading) {
    return (
      <NodeViewWrapper style={getWrapperStyle()}>
        <div ref={imageWrapperRef}>
          <ImageBlockLoading />
        </div>
      </NodeViewWrapper>
    )
  }

  // Show the actual image
  return (
    <NodeViewWrapper style={getWrapperStyle()}>
        <div contentEditable={false} ref={imageWrapperRef} style={getContentStyle()}>
          <img
            src={src}
            alt={alt || ""}
            onClick={onClick}
            className="nph-image-block"
          />
          <ImageBlockMenu editor={editor} getPos={getPos} appendTo={imageWrapperRef} />
        </div>
    </NodeViewWrapper>
  )
}

export default ImageBlockView
