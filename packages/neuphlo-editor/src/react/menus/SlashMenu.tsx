import { useCurrentEditor } from "@tiptap/react"
import {
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
} from "../../headless"
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconCode,
  IconSourceCode,
  IconPhoto,
} from "@tabler/icons-react"

export type SlashMenuProps = {
  className?: string
}

export function SlashMenu({ className }: SlashMenuProps) {
  const { editor } = useCurrentEditor()
  if (!editor) return null

  return (
    <EditorCommand className={className ?? "nph-command"}>
      <EditorCommandList
        className="nph-command__list"
        style={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <EditorCommandItem
          value="bold"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleBold()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconBold size={16} />
            <span>Bold</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="italic"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleItalic()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconItalic size={16} />
            <span>Italic</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="strike"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleStrike()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconStrikethrough size={16} />
            <span>Strike</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="heading1 h1"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 1 })
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconH1 size={16} />
            <span>Heading 1</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="heading2 h2"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 2 })
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconH2 size={16} />
            <span>Heading 2</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="heading3 h3"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 3 })
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconH3 size={16} />
            <span>Heading 3</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="heading4 h4"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleHeading({ level: 4 })
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconH4 size={16} />
            <span>Heading 4</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="bullet list ul"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleBulletList()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconList size={16} />
            <span>Bullet list</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="ordered list ol"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleOrderedList()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconListNumbers size={16} />
            <span>Ordered list</span>
          </span>
        </EditorCommandItem>
        <EditorCommandItem
          value="quote blockquote"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleBlockquote()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconBlockquote size={16} />
            <span>Quote</span>
          </span>
        </EditorCommandItem>

        <EditorCommandItem
          value="code inline"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleCode()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconCode size={16} />
            <span>Code</span>
          </span>
        </EditorCommandItem>

        <EditorCommandItem
          value="code block codeblock"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) =>
            (editor as any)
              .chain()
              .focus()
              .deleteRange(range)
              .toggleCodeBlock()
              .run()
          }
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconSourceCode size={16} />
            <span>Code Block</span>
          </span>
        </EditorCommandItem>

        <EditorCommandItem
          value="image photo picture"
          className="nph-command__item"
          onCommand={({
            editor,
            range,
          }: {
            editor: any
            range: { from: number; to: number }
          }) => {
            ;(editor as any).chain().focus().deleteRange(range).run()
            ;(editor as any).chain().focus().uploadImage().run()
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <IconPhoto size={16} />
            <span>Image</span>
          </span>
        </EditorCommandItem>
      </EditorCommandList>
    </EditorCommand>
  )
}

export default SlashMenu
