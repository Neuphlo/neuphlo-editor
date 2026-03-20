import { NodeSelection } from "@tiptap/pm/state"
import { Editor, useEditorState } from "@tiptap/react"
import { useCallback, useRef } from "react"
import { ImageBlockWidth } from "../ImageBlock/ImageBlockWidth"
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconTrash,
} from "@tabler/icons-react"

export type VideoBlockMenuProps = {
  editor: Editor
  getPos: () => number
}

export const VideoBlockMenu = ({ editor, getPos }: VideoBlockMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const { isVisible, align, width } = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return { isVisible: false, align: "center" as const, width: 100 }
      const { state } = ctx.editor
      const { selection } = state
      const isNodeSel = selection instanceof NodeSelection
      const isThisNode = isNodeSel && selection.from === getPos()

      let currentAlign: "left" | "center" | "right" = "center"
      let currentWidth = 100
      if (isThisNode) {
        const attrs = ctx.editor.getAttributes("videoBlock")
        currentAlign = attrs.align || "center"
        const widthStr = attrs.width || "100%"
        currentWidth = parseInt(widthStr) || 100
      }
      return { isVisible: isThisNode, align: currentAlign, width: currentWidth }
    },
  })

  const onAlignLeft = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setVideoBlockAlign("left")
      .run()
  }, [editor])

  const onAlignCenter = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setVideoBlockAlign("center")
      .run()
  }, [editor])

  const onAlignRight = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setVideoBlockAlign("right")
      .run()
  }, [editor])

  const onWidthChange = useCallback(
    (value: number) => {
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .setVideoBlockWidth(value)
        .run()
    },
    [editor]
  )

  const onRemove = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).deleteSelection().run()
  }, [editor])

  if (!isVisible) return null

  return (
    <div
      className="bubble-menu"
      ref={menuRef}
      style={{
        position: "absolute",
        top: "-40px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "var(--nph-z, 50)",
      }}
    >
      <button
        type="button"
        className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "left" ? " is-active" : ""}`}
        title="Align left"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignLeft}
      >
        <IconAlignLeft size={16} />
      </button>
      <button
        type="button"
        className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "center" ? " is-active" : ""}`}
        title="Align center"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignCenter}
      >
        <IconAlignCenter size={16} />
      </button>
      <button
        type="button"
        className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "right" ? " is-active" : ""}`}
        title="Align right"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignRight}
      >
        <IconAlignRight size={16} />
      </button>
      <div
        className="nph-link-popover__divider"
        style={{ margin: "0 4px" }}
      />
      <ImageBlockWidth onChange={onWidthChange} value={width} />
      <div
        className="nph-link-popover__divider"
        style={{ margin: "0 4px" }}
      />
      <button
        type="button"
        className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
        title="Remove video"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRemove}
      >
        <IconTrash size={16} />
      </button>
    </div>
  )
}

export default VideoBlockMenu
