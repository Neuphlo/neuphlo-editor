import { Node } from "@tiptap/pm/model"
import { NodeSelection } from "@tiptap/pm/state"
import { Editor, NodeViewWrapper, useEditorState } from "@tiptap/react"
import { useCallback, useRef, useState } from "react"
import { VideoBlockMenu } from "./VideoBlockMenu"
import { IconVideo, IconVideoOff } from "@tabler/icons-react"

function toEmbedUrl(url: string): string {
  // Already an embed URL — return as-is
  if (url.includes("/embed/") || url.includes("player.vimeo.com") || url.includes("loom.com/embed")) {
    return url
  }

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/
  )
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Vimeo: vimeo.com/ID or vimeo.com/channels/.../ID
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/[\w-]+\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // Loom: loom.com/share/ID
  const loomMatch = url.match(/loom\.com\/share\/([\w-]+)/)
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`
  }

  return url
}

interface VideoBlockViewProps {
  editor: Editor
  getPos: () => number
  node: Node
  updateAttributes: (attrs: Record<string, any>) => void
}

export const VideoBlockView = (props: VideoBlockViewProps) => {
  const { editor, getPos, node, updateAttributes } = props as VideoBlockViewProps & {
    node: Node & {
      attrs: {
        src: string
        width: string
        align: "left" | "center" | "right"
      }
    }
  }
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { src, width, align } = node.attrs
  const [inputUrl, setInputUrl] = useState("")
  const [videoError, setVideoError] = useState(false)

  const isSelected = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return false
      const { selection } = ctx.editor.state
      return selection instanceof NodeSelection && selection.from === getPos()
    },
  })

  const handleEmbed = useCallback(() => {
    if (!inputUrl.trim()) return
    const embedUrl = toEmbedUrl(inputUrl.trim())
    updateAttributes({ src: embedUrl })
  }, [inputUrl, updateAttributes])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleEmbed()
      }
    },
    [handleEmbed]
  )

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos())
  }, [getPos, editor.commands])

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

  // Show URL input if no src (only when editable)
  if (!src || src === "") {
    if (!editor.isEditable) return <NodeViewWrapper />
    return (
      <NodeViewWrapper style={getWrapperStyle()}>
        <div ref={wrapperRef}>
          <div className="nph-video-input">
            <div className="nph-video-input__icon">
              <IconVideo size={24} />
            </div>
            <div className="nph-video-input__content">
              <input
                type="text"
                className="nph-video-input__field"
                placeholder="Paste a YouTube, Vimeo, or video URL..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="nph-video-input__button"
                onClick={handleEmbed}
                disabled={!inputUrl.trim()}
              >
                Embed
              </button>
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  // Show error state for broken video
  if (videoError) {
    return (
      <NodeViewWrapper style={getWrapperStyle()}>
        <div contentEditable={false} ref={wrapperRef} style={{ position: "relative" }}>
          <div className="nph-video-block-error" onClick={onClick}>
            <IconVideoOff size={32} />
            <span>Video could not be loaded</span>
            <span className="nph-video-block-error__url">{src}</span>
          </div>
          {editor.isEditable && <VideoBlockMenu editor={editor} getPos={getPos} />}
        </div>
      </NodeViewWrapper>
    )
  }

  // Show the embedded video
  return (
    <NodeViewWrapper style={getWrapperStyle()}>
      <div
        contentEditable={false}
        ref={wrapperRef}
        style={{ position: "relative" }}
      >
        <div className="nph-video-block">
          <iframe
            src={src}
            className="nph-video-block__iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setVideoError(true)}
          />
          {!isSelected && (
            <div
              className="nph-video-block__overlay"
              onClick={onClick}
            />
          )}
        </div>
        {editor.isEditable && <VideoBlockMenu editor={editor} getPos={getPos} />}
      </div>
    </NodeViewWrapper>
  )
}

export default VideoBlockView
