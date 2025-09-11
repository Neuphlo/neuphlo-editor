import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  IconTypography,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconCode,
  IconChevronDown,
  IconSourceCode,
} from "@tabler/icons-react"

export type MenuListProps = {
  editor: any
  className?: string
  style?: React.CSSProperties
  onSelect?: () => void
  buttonClassName?: string
}

export function MenuList({
  editor,
  className,
  style,
  onSelect,
  buttonClassName,
}: MenuListProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("Paragraph")
  const rootRef = useRef<HTMLDivElement | null>(null)

  const computeLabel = useCallback(() => {
    if (!editor) return "Paragraph"
    if (editor.isActive("heading", { level: 1 })) return "Heading 1"
    if (editor.isActive("heading", { level: 2 })) return "Heading 2"
    if (editor.isActive("heading", { level: 3 })) return "Heading 3"
    if (editor.isActive("heading", { level: 4 })) return "Heading 4"
    if (editor.isActive("bulletList")) return "Bullet list"
    if (editor.isActive("orderedList")) return "Ordered list"
    if (editor.isActive("blockquote")) return "Quote"
    if (editor.isActive("code")) return "Code"
    if (editor.isActive("codeBlock")) return "Code Block"
    return "Paragraph"
  }, [editor])

  useEffect(() => {
    setLabel(computeLabel())
    if (!editor) return
    const update = () => setLabel(computeLabel())
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    editor.on("update", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
      editor.off("update", update)
    }
  }, [editor, computeLabel])

  useEffect(() => {
    if (!editor) return
    const close = () => setOpen(false)
    editor.on("selectionUpdate", close)
    editor.on("blur", close)
    return () => {
      editor.off("selectionUpdate", close)
      editor.off("blur", close)
    }
  }, [editor])

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (!open) return
      const el = rootRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  const handle = (fn: () => void) => () => {
    fn()
    onSelect?.()
    setOpen(false)
  }

  const isActive = useCallback((name: string) => label === name, [label])

  return (
    <div ref={rootRef} className="nph-dropdown">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={
          buttonClassName ??
          `nph-btn nph-btn-ghost nph-btn-xs${open || label !== "Paragraph" ? " is-active" : ""}`
        }
        aria-expanded={open}
        aria-label="Change block type"
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12 }}>{label}</span>
          <IconChevronDown size={16} />
        </span>
      </button>

      {open ? (
        <div
          className="nph-dropdown__panel nph-command"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div
            className={className ? className : "nph-command__list"}
            style={{ maxHeight: 240, ...(style ?? {}) }}
          >
            <button
              type="button"
              className={`nph-command__item${isActive("Paragraph") ? " is-active" : ""}`}
              aria-selected={isActive("Paragraph")}
              onClick={handle(() =>
                (editor as any).chain().focus().setParagraph().run()
              )}
            >
              <IconTypography size={16} />
              <span>Paragraph</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Heading 1") ? " is-active" : ""}`}
              aria-selected={isActive("Heading 1")}
              onClick={handle(() =>
                (editor as any)
                  .chain()
                  .focus()
                  .toggleHeading({ level: 1 })
                  .run()
              )}
            >
              <IconH1 size={16} />
              <span>Heading 1</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Heading 2") ? " is-active" : ""}`}
              aria-selected={isActive("Heading 2")}
              onClick={handle(() =>
                (editor as any)
                  .chain()
                  .focus()
                  .toggleHeading({ level: 2 })
                  .run()
              )}
            >
              <IconH2 size={16} />
              <span>Heading 2</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Heading 3") ? " is-active" : ""}`}
              aria-selected={isActive("Heading 3")}
              onClick={handle(() =>
                (editor as any)
                  .chain()
                  .focus()
                  .toggleHeading({ level: 3 })
                  .run()
              )}
            >
              <IconH3 size={16} />
              <span>Heading 3</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Heading 4") ? " is-active" : ""}`}
              aria-selected={isActive("Heading 4")}
              onClick={handle(() =>
                (editor as any)
                  .chain()
                  .focus()
                  .toggleHeading({ level: 4 })
                  .run()
              )}
            >
              <IconH4 size={16} />
              <span>Heading 4</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Bullet list") ? " is-active" : ""}`}
              aria-selected={isActive("Bullet list")}
              onClick={handle(() =>
                (editor as any).chain().focus().toggleBulletList().run()
              )}
            >
              <IconList size={16} />
              <span>Bullet list</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Ordered list") ? " is-active" : ""}`}
              aria-selected={isActive("Ordered list")}
              onClick={handle(() =>
                (editor as any).chain().focus().toggleOrderedList().run()
              )}
            >
              <IconListNumbers size={16} />
              <span>Ordered list</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Quote") ? " is-active" : ""}`}
              aria-selected={isActive("Quote")}
              onClick={handle(() =>
                (editor as any).chain().focus().toggleBlockquote().run()
              )}
            >
              <IconBlockquote size={16} />
              <span>Quote</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Code") ? " is-active" : ""}`}
              aria-selected={isActive("Code")}
              onClick={handle(() =>
                (editor as any).chain().focus().toggleCode().run()
              )}
            >
              <IconCode size={16} />
              <span>Code</span>
            </button>

            <button
              type="button"
              className={`nph-command__item${isActive("Code Block") ? " is-active" : ""}`}
              aria-selected={isActive("Code Block")}
              onClick={handle(() =>
                (editor as any).chain().focus().toggleCodeBlock().run()
              )}
            >
              <IconSourceCode size={16} />
              <span>Code Block</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MenuList
