import { useCurrentEditor } from "@tiptap/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { IconPlus, IconGripVertical } from "@tabler/icons-react"
import type { Node } from "@tiptap/pm/model"
import { BlockActionMenu } from "./BlockActionMenu"

export function DragHandleMenu() {
  const { editor } = useCurrentEditor()
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [showActions, setShowActions] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor) return

    const handler = ({ node }: { node: Node | null; editor: any }) => {
      setHoveredNode(node)
      if (!node) setShowActions(false)
    }

    // The drag handle extension calls onNodeChange
    // We use the editor's storage to communicate
    const ext = editor.extensionManager.extensions.find(
      (e) => e.name === "dragHandle"
    )
    if (ext) {
      const origOnNodeChange = ext.options.onNodeChange
      ext.options.onNodeChange = (opts: any) => {
        origOnNodeChange?.(opts)
        handler(opts)
      }
    }

    return () => {
      // Cleanup
    }
  }, [editor])

  const handleAddBlock = useCallback(() => {
    if (!editor) return
    // Get current position and insert a new paragraph after the current block
    const { state } = editor
    const { selection } = state
    const pos = selection.$anchor.end()
    editor
      .chain()
      .focus()
      .insertContentAt(pos + 1, { type: "paragraph" })
      .focus(pos + 2)
      .run()
  }, [editor])

  const handleGripClick = useCallback(() => {
    setShowActions((prev) => !prev)
  }, [])

  // Close action menu on click outside
  useEffect(() => {
    if (!showActions) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setShowActions(false)
      }
    }
    document.addEventListener("pointerdown", handleClick)
    return () => document.removeEventListener("pointerdown", handleClick)
  }, [showActions])

  if (!editor) return null

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {showActions && editor && (
        <BlockActionMenu
          editor={editor}
          onClose={() => setShowActions(false)}
        />
      )}
    </div>
  )
}

/**
 * Creates the drag handle DOM element with + and grip buttons.
 * Called by the DragHandle extension's render() option.
 */
export function createDragHandleElement(
  onAddBlock: () => void,
  onGripClick: () => void,
): HTMLElement {
  const container = document.createElement("div")
  container.className = "nph-drag-handle"

  const plusBtn = document.createElement("button")
  plusBtn.className = "nph-drag-handle__btn"
  plusBtn.type = "button"
  plusBtn.setAttribute("aria-label", "Add block")
  plusBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`
  plusBtn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    onAddBlock()
  })

  const gripBtn = document.createElement("button")
  gripBtn.className = "nph-drag-handle__btn nph-drag-handle__grip"
  gripBtn.type = "button"
  gripBtn.setAttribute("aria-label", "Drag to reorder")
  gripBtn.setAttribute("draggable", "true")
  gripBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`
  gripBtn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    onGripClick()
  })

  container.appendChild(plusBtn)
  container.appendChild(gripBtn)

  return container
}

export default DragHandleMenu
