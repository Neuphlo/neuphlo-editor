import { useCurrentEditor, useEditorState } from "@tiptap/react"
import {
  IconRowInsertBottom,
  IconColumnInsertRight,
  IconColumnInsertLeft,
  IconRowRemove,
  IconColumnRemove,
  IconTableRow,
  IconTableColumn,
  IconArrowMerge,
  IconArrowsSplit,
  IconTableOff,
  IconGripVertical,
  IconGripHorizontal,
  IconRowInsertTop,
  IconTrash,
  IconCopy,
} from "@tabler/icons-react"
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"

type GripPosition = {
  left: number
  top: number
  width: number
  height: number
}

type DropdownState = {
  type: "column" | "row"
  index: number
  x: number
  y: number
} | null

type DragState = {
  type: "column" | "row"
  fromIndex: number
  toIndex: number
} | null

export type TableMenuProps = {
  className?: string
}

export function TableMenu({ className: _className }: TableMenuProps) {
  const { editor } = useCurrentEditor()

  const tableInfo = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null
      const { $from } = ctx.editor.state.selection
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === "table") {
          return { pos: $from.start(d) - 1, depth: d }
        }
      }
      return null
    },
  })

  const [colGrips, setColGrips] = useState<GripPosition[]>([])
  const [rowGrips, setRowGrips] = useState<GripPosition[]>([])
  const [dropdown, setDropdown] = useState<DropdownState>(null)
  const [tableRect, setTableRect] = useState<DOMRect | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [drag, setDrag] = useState<DragState>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>(null)

  // Find the table DOM element
  const getTableDom = useCallback(() => {
    if (!editor || !tableInfo) return null
    return editor.view.nodeDOM(tableInfo.pos) as HTMLElement | null
  }, [editor, tableInfo])

  // Measure grip positions from the table DOM
  const measureGrips = useCallback(() => {
    const tableDom = getTableDom()
    if (!tableDom) {
      setColGrips([])
      setRowGrips([])
      setTableRect(null)
      return
    }

    const rect = tableDom.getBoundingClientRect()
    setTableRect(rect)

    // Get first row cells for column positions
    const firstRow = tableDom.querySelector("tr")
    if (!firstRow) return

    const cells = firstRow.querySelectorAll("th, td")
    const newColGrips: GripPosition[] = []
    cells.forEach((cell) => {
      const cellRect = cell.getBoundingClientRect()
      newColGrips.push({
        left: cellRect.left,
        top: rect.top,
        width: cellRect.width,
        height: 0,
      })
    })
    setColGrips(newColGrips)

    // Get all rows for row positions
    const rows = tableDom.querySelectorAll("tr")
    const newRowGrips: GripPosition[] = []
    rows.forEach((row) => {
      const rowRect = row.getBoundingClientRect()
      newRowGrips.push({
        left: rect.left,
        top: rowRect.top,
        width: 0,
        height: rowRect.height,
      })
    })
    setRowGrips(newRowGrips)
  }, [getTableDom])

  // Observe table geometry changes
  useEffect(() => {
    if (!tableInfo) {
      setColGrips([])
      setRowGrips([])
      setTableRect(null)
      setDropdown(null)
      return
    }

    measureGrips()

    const tableDom = getTableDom()
    if (!tableDom) return

    const ro = new ResizeObserver(() => measureGrips())
    ro.observe(tableDom)

    // Track hover state — expand hit area to include grip zones around the table
    const HOVER_PAD = 32 // px beyond table edges to keep grips visible
    const handleMouseMove = (e: MouseEvent) => {
      const r = tableDom.getBoundingClientRect()
      const inside =
        e.clientX >= r.left - HOVER_PAD &&
        e.clientX <= r.right + HOVER_PAD &&
        e.clientY >= r.top - HOVER_PAD &&
        e.clientY <= r.bottom + HOVER_PAD
      setIsHovering(inside)
    }
    document.addEventListener("mousemove", handleMouseMove, { passive: true })

    // Also re-measure on scroll
    const scrollParent = tableDom.closest(".nph-editor") || window
    const handleScroll = () => {
      measureGrips()
      setDropdown(null)
    }
    scrollParent.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      ro.disconnect()
      document.removeEventListener("mousemove", handleMouseMove)
      scrollParent.removeEventListener("scroll", handleScroll)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [tableInfo, getTableDom, measureGrips])

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdown) return
    const handlePointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(null)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [dropdown])

  // Close dropdown on editor transaction (typing, etc.)
  useEffect(() => {
    if (!editor || !dropdown) return
    const handleTransaction = () => setDropdown(null)
    editor.on("transaction", handleTransaction)
    return () => { editor.off("transaction", handleTransaction) }
  }, [editor, dropdown])

  const handleColGripClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!editor || !tableInfo) return

      // Select the column by clicking the first cell in this column
      const tableDom = getTableDom()
      if (!tableDom) return
      const firstRow = tableDom.querySelector("tr")
      if (!firstRow) return
      const cells = firstRow.querySelectorAll("th, td")
      const cell = cells[index] as HTMLElement | undefined
      if (!cell) return

      // Find ProseMirror position for this cell
      const pos = editor.view.posAtDOM(cell, 0)
      editor.chain().focus().setTextSelection(pos).run()

      const rect = cell.getBoundingClientRect()
      setDropdown({
        type: "column",
        index,
        x: rect.left,
        y: rect.top - 4,
      })
    },
    [editor, tableInfo, getTableDom]
  )

  const handleRowGripClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!editor || !tableInfo) return

      // Select the row by clicking the first cell in this row
      const tableDom = getTableDom()
      if (!tableDom) return
      const rows = tableDom.querySelectorAll("tr")
      const row = rows[index] as HTMLElement | undefined
      if (!row) return
      const firstCell = row.querySelector("th, td") as HTMLElement | undefined
      if (!firstCell) return

      const pos = editor.view.posAtDOM(firstCell, 0)
      editor.chain().focus().setTextSelection(pos).run()

      // Position dropdown below the grip button
      const gripEl = e.currentTarget as HTMLElement
      const gripRect = gripEl.getBoundingClientRect()
      setDropdown({
        type: "row",
        index,
        x: gripRect.left,
        y: gripRect.bottom + 4,
      })
    },
    [editor, tableInfo, getTableDom]
  )

  // --- Drag-to-reorder logic ---
  const moveColumn = useCallback(
    (from: number, to: number) => {
      if (!editor || !tableInfo || from === to) return
      const { state } = editor
      const tableStart = tableInfo.pos
      const tableNode = state.doc.nodeAt(tableStart)
      if (!tableNode) return

      const tr = state.tr
      // For each row, move the cell from `from` to `to`
      tableNode.forEach((row, rowOffset) => {
        if (row.type.name !== "tableRow") return
        const cells: { node: any; pos: number }[] = []
        row.forEach((cell, cellOffset) => {
          cells.push({ node: cell, pos: tableStart + 1 + rowOffset + 1 + cellOffset })
        })
        if (from >= cells.length || to >= cells.length) return

        // Build new row content with reordered cells
        const reordered = [...cells]
        const [moved] = reordered.splice(from, 1)
        reordered.splice(to, 0, moved)

        const rowPos = tableStart + 1 + rowOffset
        const mappedRowPos = tr.mapping.map(rowPos)
        // Replace the row content
        const newRow = row.type.create(row.attrs, reordered.map((c) => c.node))
        tr.replaceWith(mappedRowPos, mappedRowPos + row.nodeSize, newRow)
      })

      editor.view.dispatch(tr)
    },
    [editor, tableInfo]
  )

  const moveRow = useCallback(
    (from: number, to: number) => {
      if (!editor || !tableInfo || from === to) return
      const { state } = editor
      const tableStart = tableInfo.pos
      const tableNode = state.doc.nodeAt(tableStart)
      if (!tableNode) return

      const rows: any[] = []
      tableNode.forEach((row) => rows.push(row))
      if (from >= rows.length || to >= rows.length) return

      const reordered = [...rows]
      const [moved] = reordered.splice(from, 1)
      reordered.splice(to, 0, moved)

      const tr = state.tr
      tr.replaceWith(
        tableStart + 1,
        tableStart + 1 + tableNode.content.size,
        reordered
      )
      editor.view.dispatch(tr)
    },
    [editor, tableInfo]
  )

  const handleGripDragStart = useCallback(
    (type: "column" | "row", index: number, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDropdown(null)

      const startX = e.clientX
      const startY = e.clientY
      let hasMoved = false
      const dragState: DragState = { type, fromIndex: index, toIndex: index }
      dragRef.current = dragState
      setDrag(dragState)

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (!hasMoved && Math.abs(type === "column" ? dx : dy) < 5) return
        hasMoved = true

        let newIndex = index
        if (type === "column") {
          for (let i = 0; i < colGrips.length; i++) {
            const mid = colGrips[i].left + colGrips[i].width / 2
            if (ev.clientX < mid) {
              newIndex = i
              break
            }
            newIndex = i
          }
        } else {
          for (let i = 0; i < rowGrips.length; i++) {
            const mid = rowGrips[i].top + rowGrips[i].height / 2
            if (ev.clientY < mid) {
              newIndex = i
              break
            }
            newIndex = i
          }
        }

        const updated = { type, fromIndex: index, toIndex: newIndex }
        dragRef.current = updated
        setDrag(updated)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        const finalDrag = dragRef.current
        dragRef.current = null
        setDrag(null)

        if (finalDrag && hasMoved && finalDrag.fromIndex !== finalDrag.toIndex) {
          if (type === "column") {
            moveColumn(finalDrag.fromIndex, finalDrag.toIndex)
          } else {
            moveRow(finalDrag.fromIndex, finalDrag.toIndex)
          }
        }
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [colGrips, rowGrips, moveColumn, moveRow]
  )

  if (!editor || !tableInfo || colGrips.length === 0) return null

  const GRIP_SIZE = 20
  const GRIP_GAP = 4
  const gripsVisible = isHovering || !!dropdown

  const columnDropdownItems: {
    label: string
    icon: ReactNode
    action: () => void
    destructive?: boolean
    separator?: boolean
  }[] = [
    {
      label: "Toggle header column",
      icon: <IconTableColumn size={16} />,
      action: () => {
        editor.chain().focus().toggleHeaderColumn().run()
        setDropdown(null)
      },
    },
    {
      label: "Insert column before",
      icon: <IconColumnInsertLeft size={16} />,
      action: () => {
        editor.chain().focus().addColumnBefore().run()
        setDropdown(null)
      },
      separator: true,
    },
    {
      label: "Insert column after",
      icon: <IconColumnInsertRight size={16} />,
      action: () => {
        editor.chain().focus().addColumnAfter().run()
        setDropdown(null)
      },
    },
    {
      label: "Merge cells",
      icon: <IconArrowMerge size={16} />,
      action: () => {
        editor.chain().focus().mergeCells().run()
        setDropdown(null)
      },
      separator: true,
    },
    {
      label: "Split cell",
      icon: <IconArrowsSplit size={16} />,
      action: () => {
        editor.chain().focus().splitCell().run()
        setDropdown(null)
      },
    },
    {
      label: "Delete column",
      icon: <IconColumnRemove size={16} />,
      action: () => {
        editor.chain().focus().deleteColumn().run()
        setDropdown(null)
      },
      destructive: true,
      separator: true,
    },
  ]

  const rowDropdownItems: {
    label: string
    icon: ReactNode
    action: () => void
    destructive?: boolean
    separator?: boolean
  }[] = [
    {
      label: "Toggle header row",
      icon: <IconTableRow size={16} />,
      action: () => {
        editor.chain().focus().toggleHeaderRow().run()
        setDropdown(null)
      },
    },
    {
      label: "Insert row above",
      icon: <IconRowInsertTop size={16} />,
      action: () => {
        editor.chain().focus().addRowBefore().run()
        setDropdown(null)
      },
      separator: true,
    },
    {
      label: "Insert row below",
      icon: <IconRowInsertBottom size={16} />,
      action: () => {
        editor.chain().focus().addRowAfter().run()
        setDropdown(null)
      },
    },
    {
      label: "Merge cells",
      icon: <IconArrowMerge size={16} />,
      action: () => {
        editor.chain().focus().mergeCells().run()
        setDropdown(null)
      },
      separator: true,
    },
    {
      label: "Split cell",
      icon: <IconArrowsSplit size={16} />,
      action: () => {
        editor.chain().focus().splitCell().run()
        setDropdown(null)
      },
    },
    {
      label: "Delete row",
      icon: <IconRowRemove size={16} />,
      action: () => {
        editor.chain().focus().deleteRow().run()
        setDropdown(null)
      },
      destructive: true,
      separator: true,
    },
  ]

  const dropdownItems = dropdown?.type === "column" ? columnDropdownItems : rowDropdownItems

  return createPortal(
    <>
      {/* Column grips — above each column */}
      {colGrips.map((grip, i) => (
        <button
          key={`col-${i}`}
          type="button"
          className={`nph-table-grip nph-table-grip--col${gripsVisible ? " nph-table-grip--visible" : ""}${drag?.type === "column" && drag.fromIndex === i ? " nph-table-grip--dragging" : ""}`}
          style={{
            position: "fixed",
            left: grip.left + grip.width / 2 - GRIP_SIZE / 2,
            top: grip.top - GRIP_SIZE - GRIP_GAP,
            width: GRIP_SIZE,
            height: GRIP_SIZE,
            cursor: "grab",
          }}
          onMouseDown={(e) => handleGripDragStart("column", i, e)}
          onClick={(e) => handleColGripClick(i, e)}
          aria-label={`Column ${i + 1} options`}
        >
          <IconGripHorizontal size={14} />
        </button>
      ))}

      {/* Row grips — to the left of each row */}
      {rowGrips.map((grip, i) => (
        <button
          key={`row-${i}`}
          type="button"
          className={`nph-table-grip nph-table-grip--row${gripsVisible ? " nph-table-grip--visible" : ""}${drag?.type === "row" && drag.fromIndex === i ? " nph-table-grip--dragging" : ""}`}
          style={{
            position: "fixed",
            left: grip.left - GRIP_SIZE - GRIP_GAP,
            top: grip.top + grip.height / 2 - GRIP_SIZE / 2,
            width: GRIP_SIZE,
            height: GRIP_SIZE,
            cursor: "grab",
          }}
          onMouseDown={(e) => handleGripDragStart("row", i, e)}
          onClick={(e) => handleRowGripClick(i, e)}
          aria-label={`Row ${i + 1} options`}
        >
          <IconGripVertical size={14} />
        </button>
      ))}

      {/* Delete table button — below the table */}
      {tableRect && (
        <button
          type="button"
          className={`nph-table-grip nph-table-grip--delete${gripsVisible ? " nph-table-grip--visible" : ""}`}
          style={{
            position: "fixed",
            left: tableRect.left + tableRect.width / 2 - 60,
            top: tableRect.bottom + GRIP_GAP,
            width: 120,
            height: 24,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            editor.chain().focus().deleteTable().run()
          }}
          aria-label="Delete table"
        >
          <IconTableOff size={14} />
          <span style={{ fontSize: 12 }}>Delete table</span>
        </button>
      )}

      {/* Dropdown menu */}
      {dropdown && (
        <div
          ref={dropdownRef}
          className="nph-table-dropdown"
          style={{
            position: "fixed",
            left: dropdown.x,
            top: dropdown.y,
            transform: dropdown.type === "column" ? "translateY(-100%)" : undefined,
          }}
        >
          {dropdownItems.map((item, i) => (
            <div key={i}>
              {item.separator && i > 0 && <div className="nph-table-dropdown__separator" />}
              <button
                type="button"
                className={`nph-table-dropdown__item ${item.destructive ? "nph-table-dropdown__item--destructive" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={item.action}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Drag drop indicator */}
      {drag && drag.fromIndex !== drag.toIndex && tableRect && (
        drag.type === "column" ? (
          <div
            className="nph-table-drop-indicator nph-table-drop-indicator--col"
            style={{
              position: "fixed",
              left: drag.toIndex < colGrips.length
                ? colGrips[drag.toIndex].left - 1
                : colGrips[colGrips.length - 1].left + colGrips[colGrips.length - 1].width,
              top: tableRect.top,
              width: 2,
              height: tableRect.height,
            }}
          />
        ) : (
          <div
            className="nph-table-drop-indicator nph-table-drop-indicator--row"
            style={{
              position: "fixed",
              left: tableRect.left,
              top: drag.toIndex < rowGrips.length
                ? rowGrips[drag.toIndex].top - 1
                : rowGrips[rowGrips.length - 1].top + rowGrips[rowGrips.length - 1].height,
              width: tableRect.width,
              height: 2,
            }}
          />
        )
      )}
    </>,
    document.body
  )
}

export default TableMenu
