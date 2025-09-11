import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  IconLink,
  IconExternalLink,
  IconTrash,
  IconCornerDownLeft,
} from "@tabler/icons-react"

export type LinkPopoverProps = {
  editor: any | null
  hideWhenUnavailable?: boolean
  autoOpenOnLinkActive?: boolean
  onSetLink?: () => void
  onOpenChange?: (isOpen: boolean) => void
}

export function LinkPopover({
  editor,
  hideWhenUnavailable = false,
  autoOpenOnLinkActive = true,
  onSetLink,
  onOpenChange,
}: LinkPopoverProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string>("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const isInCode =
    !!editor?.isActive?.("code") || !!editor?.isActive?.("codeBlock")
  const isActive = !!editor?.isActive?.("link")
  const currentHref: string = useMemo(
    () =>
      editor?.getAttributes ? (editor.getAttributes("link")?.href ?? "") : "",
    [editor, editor?.state?.selection?.from, editor?.state?.selection?.to]
  )

  const canSet = useMemo(() => {
    if (!editor || isInCode) return false
    try {
      return editor
        .can()
        .chain()
        .focus()
        .setLink({ href: "https://example.com" })
        .run()
    } catch (_) {
      return false
    }
  }, [editor, isInCode])

  useEffect(() => {
    if (!editor) return
    const update = () => {
      const next = editor.getAttributes("link")?.href ?? ""
      setUrl(next)
      const linkActive = editor.isActive("link")
      if (autoOpenOnLinkActive && editor.isFocused && linkActive) setOpen(true)
      if (!linkActive) setOpen(false)
    }
    update()
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    editor.on("update", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
      editor.off("update", update)
    }
  }, [editor, autoOpenOnLinkActive])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    onOpenChange?.(open)
  }, [open, onOpenChange])

  if (!editor) return null
  if (hideWhenUnavailable && !canSet && !isActive) return null

  const applyLink = () => {
    if (!url) return
    ;(editor as any)
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run()
    onSetLink?.()
    setOpen(false)
  }

  const removeLink = () => {
    ;(editor as any).chain().focus().unsetLink().run()
    setOpen(false)
  }

  // Close when clicking outside of the popover/button container
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return
      const el = rootRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [open])

  return (
    <div
      ref={rootRef}
      className="nph-dropdown"
      style={{ position: "relative" }}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${isActive ? " is-active" : ""}`}
        aria-label={isActive ? "Edit link" : "Add link"}
        aria-pressed={isActive}
        aria-expanded={open}
        disabled={isInCode}
        aria-disabled={isInCode}
        title={isActive ? currentHref || "Edit link" : "Add link"}
      >
        <IconLink size={16} />
      </button>

      {open ? (
        <div
          className="nph-dropdown__panel"
          style={{
            padding: 0,
            minWidth: 320,
            background: "transparent",
            boxShadow: "none",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          role="dialog"
          aria-label="Link editor"
        >
          <div className="nph-link-popover">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="nph-link-popover__input"
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  applyLink()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  setOpen(false)
                }
              }}
            />
            <div className="nph-link-popover__divider" />
            <button
              type="button"
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              title="Apply"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applyLink}
              disabled={!url}
            >
              <IconCornerDownLeft size={16} />
            </button>
            <button
              type="button"
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              title="Open in new tab"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const target = url || currentHref
                if (target) window.open(target, "_blank", "noopener,noreferrer")
              }}
              disabled={!url && !currentHref}
            >
              <IconExternalLink size={16} />
            </button>
            <button
              type="button"
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              title="Remove link"
              onMouseDown={(e) => e.preventDefault()}
              onClick={removeLink}
              disabled={!isActive}
            >
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default LinkPopover
