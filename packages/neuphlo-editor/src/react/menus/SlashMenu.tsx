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
    <EditorCommand className={className}>
      <EditorCommandList>
        <EditorCommandItem
          onSelect={() => (editor as any).chain().focus().toggleBold().run()}
        >
          Bold
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() => (editor as any).chain().focus().toggleItalic().run()}
        >
          Italic
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() => (editor as any).chain().focus().toggleStrike().run()}
        >
          Strike
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() =>
            (editor as any).chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          Heading 1
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() =>
            (editor as any).chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          Heading 2
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() =>
            (editor as any).chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          Heading 3
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() =>
            (editor as any).chain().focus().toggleHeading({ level: 4 }).run()
          }
        >
          Heading 4
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() =>
            (editor as any).chain().focus().toggleBulletList().run()
          }
        >
          Bullet list
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() =>
            (editor as any).chain().focus().toggleOrderedList().run()
          }
        >
          Ordered list
        </EditorCommandItem>
        <EditorCommandItem
          onSelect={() =>
            (editor as any).chain().focus().toggleBlockquote().run()
          }
        >
          Quote
        </EditorCommandItem>
      </EditorCommandList>
    </EditorCommand>
  )
}

export default SlashMenu
