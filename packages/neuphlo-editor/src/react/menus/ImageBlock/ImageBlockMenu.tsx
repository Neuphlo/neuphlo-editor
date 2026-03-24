import { NodeSelection } from "@tiptap/pm/state"
import { Editor, useEditorState } from "@tiptap/react"
import { useCallback, useRef } from "react"
import { ImageBlockWidth } from "./ImageBlockWidth"
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconTrash,
} from "@tabler/icons-react"

export type ImageBlockMenuProps = {
  editor: Editor
  getPos: () => number
  appendTo?: React.RefObject<HTMLElement | null>
}

export const ImageBlockMenu = ({ editor, getPos, appendTo }: ImageBlockMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const { isVisible, align, width } = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return { isVisible: false, align: "center" as const, width: 100 }
      const { state } = ctx.editor
      const { selection } = state
      if (!ctx.editor.isEditable) return { isVisible: false, align: "center" as const, width: 100 }
      if (!ctx.editor.isFocused) return { isVisible: false, align: "center" as const, width: 100 }
      const isNodeSel = selection instanceof NodeSelection
      const isThisNode = isNodeSel && selection.from === getPos()
      const visible = isThisNode

      let currentAlign: "left" | "center" | "right" = "center"
      let currentWidth = 100
      if (visible) {
        const attrs = ctx.editor.getAttributes("imageBlock")
        currentAlign = attrs.align || "center"
        const widthStr = attrs.width || "100%"
        currentWidth = parseInt(widthStr) || 100
      }
      return { isVisible: visible, align: currentAlign, width: currentWidth }
    },
  })

  const onAlignImageLeft = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setImageBlockAlign("left")
      .run()
  }, [editor])

  const onAlignImageCenter = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setImageBlockAlign("center")
      .run()
  }, [editor])

  const onAlignImageRight = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setImageBlockAlign("right")
      .run()
  }, [editor])

  const onWidthChange = useCallback(
    (value: number) => {
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .setImageBlockWidth(value)
        .run()
    },
    [editor]
  )

  const onRemoveImage = useCallback(() => {
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
        onClick={onAlignImageLeft}
      >
        <IconAlignLeft size={16} />
      </button>
      <button
        type="button"
        className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "center" ? " is-active" : ""}`}
        title="Align center"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignImageCenter}
      >
        <IconAlignCenter size={16} />
      </button>
      <button
        type="button"
        className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "right" ? " is-active" : ""}`}
        title="Align right"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignImageRight}
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
        title="Remove image"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRemoveImage}
      >
        <IconTrash size={16} />
      </button>
    </div>
  )
}

export default ImageBlockMenu
