import { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { useCallback, useRef, useState, useEffect } from "react"
import { ImageBlockWidth } from "../ImageBlock/ImageBlockWidth"
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconTrash,
} from "@tabler/icons-react"

export type VideoBlockMenuProps = {
  editor: Editor
}

export const VideoBlockMenu = ({ editor }: VideoBlockMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [align, setAlign] = useState<"left" | "center" | "right">("center")
  const [width, setWidth] = useState<number>(100)

  useEffect(() => {
    if (!editor) return
    const update = () => {
      if (!editor.isActive("videoBlock")) return
      const attrs = editor.getAttributes("videoBlock")
      setAlign(attrs.align || "center")
      const widthStr = attrs.width || "100%"
      setWidth(parseInt(widthStr) || 100)
    }
    update()
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
    }
  }, [editor])

  const shouldShow = useCallback(() => {
    if (!editor) return false

    const { state } = editor
    const { selection } = state

    // Must be a NodeSelection
    if (selection.constructor.name !== "NodeSelection") return false

    // The selected node must be a videoBlock
    const node = (selection as any).node
    if (!node || node.type.name !== "videoBlock") return false

    return true
  }, [editor])

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

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      updateDelay={0}
    >
      <div className="bubble-menu" ref={menuRef}>
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
    </BubbleMenu>
  )
}

export default VideoBlockMenu
