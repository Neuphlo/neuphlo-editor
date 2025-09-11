import { useCurrentEditor } from "@tiptap/react"
import { EditorBubble } from "../../headless"
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
} from "@tabler/icons-react"

export type TextMenuProps = {
  className?: string
  options?: Record<string, unknown>
}

export function TextMenu({ className, options }: TextMenuProps) {
  const { editor } = useCurrentEditor()
  if (!editor) return null

  return (
    <EditorBubble
      options={{ placement: "bottom", offset: 8, ...(options ?? {}) }}
    >
      <div className={className ? `bubble-menu ${className}` : "bubble-menu"}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (editor as any).chain().focus().toggleBold().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("bold") ? " is-active" : ""}`}
          aria-pressed={editor.isActive("bold")}
          aria-label="Toggle bold"
        >
          <IconBold size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (editor as any).chain().focus().toggleItalic().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("italic") ? " is-active" : ""}`}
          aria-pressed={editor.isActive("italic")}
          aria-label="Toggle italic"
        >
          <IconItalic size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (editor as any).chain().focus().toggleStrike().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("strike") ? " is-active" : ""}`}
          aria-pressed={editor.isActive("strike")}
          aria-label="Toggle strike"
        >
          <IconStrikethrough size={16} />
        </button>
      </div>
    </EditorBubble>
  )
}

export default TextMenu
