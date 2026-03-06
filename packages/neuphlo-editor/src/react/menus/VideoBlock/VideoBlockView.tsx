import { Node } from "@tiptap/pm/model"
import { Editor, NodeViewWrapper } from "@tiptap/react"
import { useCallback, useRef, useState } from "react"
import { VideoBlockMenu } from "./VideoBlockMenu"
import { IconVideo } from "@tabler/icons-react"

function toEmbedUrl(url: string): string {
  // YouTube: youtube.com/watch?v=ID or youtu.be/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  )
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
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

  // Show URL input if no src
  if (!src || src === "") {
    return (
      <NodeViewWrapper>
        <div style={getWrapperStyle()}>
          <div className="nph-video-input" ref={wrapperRef}>
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

  // Show the embedded video
  return (
    <NodeViewWrapper>
      <div style={getWrapperStyle()}>
        <div
          contentEditable={false}
          ref={wrapperRef}
          style={{ position: "relative" }}
        >
          <div className="nph-video-block" onClick={onClick}>
            <iframe
              src={src}
              className="nph-video-block__iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      <VideoBlockMenu editor={editor} />
    </NodeViewWrapper>
  )
}

export default VideoBlockView
