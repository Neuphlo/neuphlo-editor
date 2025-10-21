import { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { useCallback, useRef, useState, useEffect } from "react"
import { ImageBlockWidth } from "./ImageBlockWidth"
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconTrash,
} from "@tabler/icons-react"

export type ImageBlockMenuProps = {
  editor: Editor
  appendTo?: React.RefObject<HTMLElement | null>
}

export const ImageBlockMenu = ({ editor, appendTo }: ImageBlockMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [align, setAlign] = useState<"left" | "center" | "right">("center")
  const [width, setWidth] = useState<number>(100)

  useEffect(() => {
    if (!editor) return
    const update = () => {
      if (!editor.isActive("imageBlock")) return
      const attrs = editor.getAttributes("imageBlock")
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

  const getReferenceClientRect = useCallback(() => {
    if (!editor) return new DOMRect(-1000, -1000, 0, 0)

    const { view } = editor
    const { state } = view
    const { selection } = state

    // Get the node at the current selection
    const node = selection instanceof (window as any).ProseMirror?.state?.NodeSelection
      ? (selection as any).node
      : null

    if (node && node.type.name === "imageBlock") {
      const nodePos = (selection as any).from
      const domNode = view.nodeDOM(nodePos)
      if (domNode && domNode instanceof HTMLElement) {
        return domNode.getBoundingClientRect()
      }
    }

    // Fallback: try to find the image block element
    const imageBlockElements = document.querySelectorAll('[data-node-view-wrapper]')
    for (const el of Array.from(imageBlockElements)) {
      if (el.querySelector("img")) {
        return el.getBoundingClientRect()
      }
    }

    return new DOMRect(-1000, -1000, 0, 0)
  }, [editor])

  const shouldShow = useCallback(() => {
    if (!editor) return false
    const isActive = editor.isActive("imageBlock")
    if (!isActive) return false

    // Check if it's a node selection
    const { state } = editor
    const { selection } = state
    const isNodeSelection = selection.constructor.name === "NodeSelection"

    return isNodeSelection
  }, [editor])

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
    </BubbleMenu>
  )
}

export default ImageBlockMenu
