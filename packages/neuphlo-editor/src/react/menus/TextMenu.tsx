import { useCurrentEditor } from "@tiptap/react"
import { useEffect, useState } from "react"
import { EditorBubble } from "../../headless"
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconArrowBackUp,
} from "@tabler/icons-react"
import { MenuList } from "./MenuList"

export type TextMenuProps = {
  className?: string
  options?: Record<string, unknown>
}

export function TextMenu({ className, options }: TextMenuProps) {
  const { editor } = useCurrentEditor()
  if (!editor) return null

  const [, setTick] = useState(0)
  useEffect(() => {
    const update = () => setTick((v) => v + 1)
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    editor.on("update", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
      editor.off("update", update)
    }
  }, [editor])

  return (
    <EditorBubble
      options={{ placement: "bottom", offset: 8, ...(options ?? {}) }}
    >
      <div className={className ? `bubble-menu ${className}` : "bubble-menu"}>
        <MenuList editor={editor} />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (editor as any).chain().focus().toggleBold().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("bold") ? " is-active" : ""}`}
          disabled={editor.isActive("code") || editor.isActive("codeBlock")}
          aria-disabled={
            editor.isActive("code") || editor.isActive("codeBlock")
          }
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
          disabled={editor.isActive("code") || editor.isActive("codeBlock")}
          aria-disabled={
            editor.isActive("code") || editor.isActive("codeBlock")
          }
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
          disabled={editor.isActive("code") || editor.isActive("codeBlock")}
          aria-disabled={
            editor.isActive("code") || editor.isActive("codeBlock")
          }
          aria-pressed={editor.isActive("strike")}
          aria-label="Toggle strike"
        >
          <IconStrikethrough size={16} />
        </button>

        {(() => {
          const isHeading =
            editor.isActive("heading", { level: 1 }) ||
            editor.isActive("heading", { level: 2 }) ||
            editor.isActive("heading", { level: 3 }) ||
            editor.isActive("heading", { level: 4 })
          const isList =
            editor.isActive("bulletList") || editor.isActive("orderedList")
          const isBlockquote = editor.isActive("blockquote")
          const isCodeBlock = editor.isActive("codeBlock")
          const hasInlineMarks =
            editor.isActive("bold") ||
            editor.isActive("italic") ||
            editor.isActive("strike") ||
            editor.isActive("code")

          const isPlainParagraph =
            editor.isActive("paragraph") &&
            !isHeading &&
            !isList &&
            !isBlockquote &&
            !isCodeBlock &&
            !hasInlineMarks

          return (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const chain = (editor as any).chain().focus()
                if (editor.isActive("bulletList")) {
                  chain.toggleBulletList()
                } else if (editor.isActive("orderedList")) {
                  chain.toggleOrderedList()
                } else if (editor.isActive("blockquote")) {
                  chain.toggleBlockquote()
                } else if (editor.isActive("codeBlock")) {
                  chain.toggleCodeBlock()
                } else if (editor.isActive("heading", { level: 1 })) {
                  chain.toggleHeading({ level: 1 })
                } else if (editor.isActive("heading", { level: 2 })) {
                  chain.toggleHeading({ level: 2 })
                } else if (editor.isActive("heading", { level: 3 })) {
                  chain.toggleHeading({ level: 3 })
                } else if (editor.isActive("heading", { level: 4 })) {
                  chain.toggleHeading({ level: 4 })
                } else {
                  chain.setParagraph()
                }
                if (editor.isActive("bold")) chain.unsetMark("bold")
                if (editor.isActive("italic")) chain.unsetMark("italic")
                if (editor.isActive("strike")) chain.unsetMark("strike")
                if (editor.isActive("code")) chain.unsetMark("code")
                chain.run()
              }}
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              aria-label="Revert to paragraph"
              title="Revert to paragraph"
              disabled={isPlainParagraph}
              aria-disabled={isPlainParagraph}
            >
              <IconArrowBackUp size={16} />
            </button>
          )
        })()}
      </div>
    </EditorBubble>
  )
}

export default TextMenu
