import { useCurrentEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { useCallback, useState, useRef, useEffect } from "react"
import {
  IconLink,
  IconExternalLink,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react"

export function LinkMenu() {
  const { editor } = useCurrentEditor()
  const [url, setUrl] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const currentUrl = editor?.getAttributes("link")?.href || ""

  useEffect(() => {
    setUrl(currentUrl)
  }, [currentUrl])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSetLink = useCallback(() => {
    if (!editor || !url) return

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run()

    setIsEditing(false)
  }, [editor, url])

  const handleRemoveLink = useCallback(() => {
    if (!editor) return

    editor.chain().focus().unsetLink().run()
    setIsEditing(false)
  }, [editor])

  const handleOpenLink = useCallback(() => {
    if (url || currentUrl) {
      window.open(url || currentUrl, "_blank", "noopener,noreferrer")
    }
  }, [url, currentUrl])

  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="linkBubbleMenu"
      shouldShow={({ editor: e, state }) => {
        // Show when link is active (whether selection is empty or not)
        return e.isActive("link")
      }}
      updateDelay={0}
    >
      <div className="bubble-menu">
        {!isEditing ? (
          <>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsEditing(true)}
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              aria-label="Edit link"
              title={currentUrl}
            >
              <IconLink size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleOpenLink}
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              aria-label="Open link"
              title="Open link in new tab"
            >
              <IconExternalLink size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleRemoveLink}
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              aria-label="Remove link"
              title="Remove link"
            >
              <IconTrash size={16} />
            </button>
          </>
        ) : (
          <>
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSetLink()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  setUrl(currentUrl)
                  setIsEditing(false)
                }
              }}
              placeholder="https://example.com"
              className="nph-link-input"
              style={{
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minWidth: "200px",
                fontSize: "14px",
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSetLink}
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              aria-label="Apply"
              title="Apply"
              disabled={!url}
            >
              <IconCheck size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setUrl(currentUrl)
                setIsEditing(false)
              }}
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              aria-label="Cancel"
              title="Cancel"
            >
              <IconX size={16} />
            </button>
          </>
        )}
      </div>
    </BubbleMenu>
  )
}

export default LinkMenu
