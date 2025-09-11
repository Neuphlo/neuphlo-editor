import { useCurrentEditor } from "@tiptap/react"
import {
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
} from "../../headless"

export type SlashMenuProps = {
  className?: string
}

export function SlashMenu({ className }: SlashMenuProps) {
  const { editor } = useCurrentEditor()
  if (!editor) return null

  return (
    <EditorCommand
      className={className ?? "nph-command"}
      style={{
        background: "var(--background, #ffffff)",
        color: "var(--foreground, #111827)",
        border: "1px solid var(--border, rgba(0,0,0,0.08))",
        borderRadius: "8px",
        padding: "4px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <EditorCommandList
        className="nph-command__list"
        style={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <EditorCommandItem
          value="bold"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any).chain().focus().deleteRange(range).toggleBold().run()
          }
        >
          Bold
        </EditorCommandItem>
        <EditorCommandItem
          value="italic"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleItalic()
              .run()
          }
        >
          Italic
        </EditorCommandItem>
        <EditorCommandItem
          value="strike"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleStrike()
              .run()
          }
        >
          Strike
        </EditorCommandItem>
        <EditorCommandItem
          value="heading1 h1"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 1 })
              .run()
          }
        >
          Heading 1
        </EditorCommandItem>
        <EditorCommandItem
          value="heading2 h2"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 2 })
              .run()
          }
        >
          Heading 2
        </EditorCommandItem>
        <EditorCommandItem
          value="heading3 h3"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 3 })
              .run()
          }
        >
          Heading 3
        </EditorCommandItem>
        <EditorCommandItem
          value="heading4 h4"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 4 })
              .run()
          }
        >
          Heading 4
        </EditorCommandItem>
        <EditorCommandItem
          value="bullet list ul"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleBulletList()
              .run()
          }
        >
          Bullet list
        </EditorCommandItem>
        <EditorCommandItem
          value="ordered list ol"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleOrderedList()
              .run()
          }
        >
          Ordered list
        </EditorCommandItem>
        <EditorCommandItem
          value="quote blockquote"
          className="nph-command__item"
          onCommand={({ editor, range }: { editor: any; range: { from: number; to: number } }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleBlockquote()
              .run()
          }
        >
          Quote
        </EditorCommandItem>
      </EditorCommandList>
    </EditorCommand>
  )
}

export default SlashMenu
