import type { Editor } from "@tiptap/react"
import {
  IconCopy,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconClipboard,
} from "@tabler/icons-react"
import { useCallback } from "react"

export type BlockActionMenuProps = {
  editor: Editor
  onClose: () => void
}

export function BlockActionMenu({ editor, onClose }: BlockActionMenuProps) {
  const executeAndClose = useCallback(
    (fn: () => void) => {
      fn()
      onClose()
    },
    [onClose]
  )

  const handleDelete = useCallback(() => {
    executeAndClose(() => {
      editor.commands.deleteSelection()
    })
  }, [editor, executeAndClose])

  const handleDuplicate = useCallback(() => {
    executeAndClose(() => {
      const { state } = editor
      const { selection } = state
      const { $anchor } = selection

      // Find the top-level block
      const depth = $anchor.depth > 0 ? 1 : 0
      const start = $anchor.start(depth)
      const end = $anchor.end(depth)
      const node = state.doc.nodeAt(start - 1)

      if (node) {
        const insertPos = end + 1
        editor
          .chain()
          .focus()
          .insertContentAt(insertPos, node.toJSON())
          .run()
      }
    })
  }, [editor, executeAndClose])

  const handleMoveUp = useCallback(() => {
    executeAndClose(() => {
      const { state } = editor
      const { selection } = state
      const { $anchor } = selection
      const depth = $anchor.depth > 0 ? 1 : 0
      const blockStart = $anchor.start(depth) - 1

      if (blockStart <= 0) return // Already at top

      const node = state.doc.nodeAt(blockStart)
      if (!node) return

      // Find previous sibling
      const $pos = state.doc.resolve(blockStart)
      const index = $pos.index($pos.depth)
      if (index === 0) return // First child

      const prevNode = $pos.node($pos.depth).child(index - 1)
      const prevStart = blockStart - prevNode.nodeSize

      editor.chain().focus()
        .command(({ tr }) => {
          const currentSlice = state.doc.slice(blockStart, blockStart + node.nodeSize)
          tr.delete(blockStart, blockStart + node.nodeSize)
          tr.insert(prevStart, currentSlice.content)
          return true
        })
        .run()
    })
  }, [editor, executeAndClose])

  const handleMoveDown = useCallback(() => {
    executeAndClose(() => {
      const { state } = editor
      const { selection } = state
      const { $anchor } = selection
      const depth = $anchor.depth > 0 ? 1 : 0
      const blockStart = $anchor.start(depth) - 1

      const node = state.doc.nodeAt(blockStart)
      if (!node) return
      const blockEnd = blockStart + node.nodeSize

      // Check if there's a next sibling
      const $pos = state.doc.resolve(blockStart)
      const parent = $pos.node($pos.depth)
      const index = $pos.index($pos.depth)
      if (index >= parent.childCount - 1) return // Last child

      const nextNode = parent.child(index + 1)
      const nextEnd = blockEnd + nextNode.nodeSize

      editor.chain().focus()
        .command(({ tr }) => {
          const currentSlice = state.doc.slice(blockStart, blockEnd)
          tr.delete(blockStart, blockEnd)
          const insertPos = blockStart + nextNode.nodeSize
          tr.insert(insertPos, currentSlice.content)
          return true
        })
        .run()
    })
  }, [editor, executeAndClose])

  const handleCopyToClipboard = useCallback(() => {
    executeAndClose(() => {
      const { state } = editor
      const { selection } = state
      const { $anchor } = selection
      const depth = $anchor.depth > 0 ? 1 : 0
      const start = $anchor.start(depth) - 1
      const node = state.doc.nodeAt(start)
      if (node) {
        const text = node.textContent
        navigator.clipboard.writeText(text).catch(() => {
          // Fallback: silently fail
        })
      }
    })
  }, [editor, executeAndClose])

  return (
    <div className="nph-block-action-menu nph-command">
      <div className="nph-command__list" style={{ maxHeight: "none" }}>
        <button
          type="button"
          className="nph-command__item"
          onClick={handleDelete}
          onMouseDown={(e) => e.preventDefault()}
        >
          <IconTrash size={16} />
          <span>Delete</span>
        </button>
        <button
          type="button"
          className="nph-command__item"
          onClick={handleDuplicate}
          onMouseDown={(e) => e.preventDefault()}
        >
          <IconCopy size={16} />
          <span>Duplicate</span>
        </button>
        <button
          type="button"
          className="nph-command__item"
          onClick={handleCopyToClipboard}
          onMouseDown={(e) => e.preventDefault()}
        >
          <IconClipboard size={16} />
          <span>Copy to clipboard</span>
        </button>
        <button
          type="button"
          className="nph-command__item"
          onClick={handleMoveUp}
          onMouseDown={(e) => e.preventDefault()}
        >
          <IconArrowUp size={16} />
          <span>Move up</span>
        </button>
        <button
          type="button"
          className="nph-command__item"
          onClick={handleMoveDown}
          onMouseDown={(e) => e.preventDefault()}
        >
          <IconArrowDown size={16} />
          <span>Move down</span>
        </button>
      </div>
    </div>
  )
}

export default BlockActionMenu
