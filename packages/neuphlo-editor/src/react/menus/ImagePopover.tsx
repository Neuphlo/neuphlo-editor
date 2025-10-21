import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  IconPhoto,
  IconTrash,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from "@tabler/icons-react"

export type ImagePopoverProps = {
  editor: any | null
  hideWhenUnavailable?: boolean
  onSetImage?: () => void
  onOpenChange?: (isOpen: boolean) => void
}

export function ImagePopover({
  editor,
  hideWhenUnavailable = false,
  onSetImage,
  onOpenChange,
}: ImagePopoverProps) {
  const [open, setOpen] = useState(false)
  const [alt, setAlt] = useState<string>("")
  const [size, setSize] = useState<number>(100) // Size as percentage (25-200%)
  const [align, setAlign] = useState<"left" | "center" | "right">("left")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const isActive = !!editor?.isActive?.("image")
  const currentAttrs = useMemo(() => {
    if (!editor?.getAttributes) return { alt: "", width: "", align: "left" }
    return (
      editor.getAttributes("image") ?? {
        alt: "",
        width: "",
        align: "left",
      }
    )
  }, [editor, editor?.state?.selection?.from, editor?.state?.selection?.to])

  const canSet = useMemo(() => {
    if (!editor) return false
    try {
      return editor
        .can()
        .chain()
        .focus()
        .setImage({ src: "https://example.com/image.jpg" })
        .run()
    } catch (_) {
      return false
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const update = () => {
      const attrs = editor.getAttributes("image") ?? {
        alt: "",
        width: "",
        align: "left",
      }
      setAlt(attrs.alt ?? "")
      // Parse width to extract percentage or convert px to percentage
      const width = attrs.width ?? ""
      if (width.includes("%")) {
        setSize(parseInt(width) || 100)
      } else if (width.includes("px")) {
        setSize(100) // Default to 100% if px is used
      } else {
        setSize(100)
      }
      setAlign(attrs.align ?? "left")
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
  }, [editor])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    onOpenChange?.(open)
  }, [open, onOpenChange])

  if (!editor) return null
  if (hideWhenUnavailable && !canSet && !isActive) return null

  const updateImageSize = (newSize: number) => {
    setSize(newSize)
    if (isActive) {
      ;(editor as any).commands.updateAttributes("image", {
        width: `${newSize}%`,
      })
    }
  }

  const updateImageAlign = (newAlign: "left" | "center" | "right") => {
    setAlign(newAlign)
    if (isActive) {
      ;(editor as any).commands.updateAttributes("image", { align: newAlign })
    }
  }

  const updateAltText = (newAlt: string) => {
    setAlt(newAlt)
    if (isActive) {
      ;(editor as any).commands.updateAttributes("image", { alt: newAlt })
    }
  }

  const removeImage = () => {
    ;(editor as any).chain().focus().deleteSelection().run()
    setOpen(false)
  }

  const triggerUpload = () => {
    ;(editor as any).chain().focus().uploadImage().run()
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
        aria-label={isActive ? "Edit image" : "Add image"}
        aria-pressed={isActive}
        aria-expanded={open}
        title={isActive ? "Edit image" : "Add image"}
      >
        <IconPhoto size={16} />
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
          aria-label="Image editor"
        >
          <div className="nph-link-popover">
            <input
              ref={inputRef}
              type="text"
              value={alt}
              onChange={(e) => updateAltText(e.target.value)}
              placeholder="Alt text"
              className="nph-link-popover__input"
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault()
                  setOpen(false)
                }
              }}
            />
            <div className="nph-link-popover__divider" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 180,
              }}
            >
              <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                {size}%
              </span>
              <input
                type="range"
                min="25"
                max="100"
                step="5"
                value={size}
                onChange={(e) => updateImageSize(parseInt(e.target.value))}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ flex: 1 }}
              />
            </div>
            <div className="nph-link-popover__divider" />
            <button
              type="button"
              className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "left" ? " is-active" : ""}`}
              title="Align left"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => updateImageAlign("left")}
            >
              <IconAlignLeft size={16} />
            </button>
            <button
              type="button"
              className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "center" ? " is-active" : ""}`}
              title="Align center"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => updateImageAlign("center")}
            >
              <IconAlignCenter size={16} />
            </button>
            <button
              type="button"
              className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "right" ? " is-active" : ""}`}
              title="Align right"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => updateImageAlign("right")}
            >
              <IconAlignRight size={16} />
            </button>
            <button
              type="button"
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              title="Upload image"
              onMouseDown={(e) => e.preventDefault()}
              onClick={triggerUpload}
            >
              <IconPhoto size={16} />
            </button>
            <button
              type="button"
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              title="Remove image"
              onMouseDown={(e) => e.preventDefault()}
              onClick={removeImage}
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

export default ImagePopover
