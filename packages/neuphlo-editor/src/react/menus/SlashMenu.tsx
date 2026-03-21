import { useCurrentEditor } from "@tiptap/react"
import { useAtomValue } from "jotai"
import {
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
} from "../../headless"
import { queryAtom } from "../../headless/utils/atoms"
import { novelStore } from "../../headless/utils/store"
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
  IconSourceCode,
  IconPhoto,
  IconVideo,
  IconMinus,
  IconTable,
  IconListCheck,
} from "@tabler/icons-react"
import type { ComponentType } from "react"
import { useMemo } from "react"

type SlashCommandItem = {
  value: string
  label: string
  description: string
  icon: ComponentType<{ size?: number }>
  onCommand: (args: { editor: any; range: { from: number; to: number } }) => void
}

type SlashCommandGroup = {
  group: string
  items: SlashCommandItem[]
}

const SLASH_COMMANDS: SlashCommandGroup[] = [
  {
    group: "Format",
    items: [
      {
        value: "paragraph text",
        label: "Paragraph",
        description: "Plain text block",
        icon: IconTypography,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).setParagraph().run(),
      },
      {
        value: "heading1 h1",
        label: "Heading 1",
        description: "Large section heading",
        icon: IconH1,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run(),
      },
      {
        value: "heading2 h2",
        label: "Heading 2",
        description: "Medium section heading",
        icon: IconH2,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run(),
      },
      {
        value: "heading3 h3",
        label: "Heading 3",
        description: "Small section heading",
        icon: IconH3,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run(),
      },
      {
        value: "heading4 h4",
        label: "Heading 4",
        description: "Subsection heading",
        icon: IconH4,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 4 }).run(),
      },
    ],
  },
  {
    group: "Lists",
    items: [
      {
        value: "bullet list ul",
        label: "Bullet List",
        description: "Unordered list of items",
        icon: IconList,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBulletList().run(),
      },
      {
        value: "ordered list ol numbered",
        label: "Numbered List",
        description: "Ordered list of items",
        icon: IconListNumbers,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
      },
      {
        value: "task list todo checklist",
        label: "Task List",
        description: "Checklist of to-do items",
        icon: IconListCheck,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleTaskList().run(),
      },
      {
        value: "quote blockquote",
        label: "Blockquote",
        description: "Highlight a quote or excerpt",
        icon: IconBlockquote,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
      },
    ],
  },
  {
    group: "Insert",
    items: [
      {
        value: "image photo picture",
        label: "Image",
        description: "Upload or embed an image",
        icon: IconPhoto,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).setImageBlock({ src: "" }).run(),
      },
      {
        value: "video embed youtube vimeo",
        label: "Video",
        description: "Embed a YouTube or Vimeo video",
        icon: IconVideo,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).setVideoBlock({ src: "" }).run(),
      },
      {
        value: "table grid",
        label: "Table",
        description: "Insert a table with rows and columns",
        icon: IconTable,
        onCommand: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run()
          if (editor.commands.insertTable) {
            editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          }
        },
      },
      {
        value: "code block codeblock",
        label: "Code Block",
        description: "Syntax-highlighted code block",
        icon: IconSourceCode,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
      },
      {
        value: "code inline",
        label: "Inline Code",
        description: "Mark text as inline code",
        icon: IconCode,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleCode().run(),
      },
      {
        value: "divider horizontal rule separator",
        label: "Divider",
        description: "Horizontal separator line",
        icon: IconMinus,
        onCommand: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
      },
    ],
  },
]

export type SlashMenuProps = {
  className?: string
}

export function SlashMenu({ className }: SlashMenuProps) {
  const { editor } = useCurrentEditor()
  const query = useAtomValue(queryAtom, { store: novelStore })

  // Pre-filter groups to determine if we should show empty state
  const filteredGroups = useMemo(() => {
    if (!query) return SLASH_COMMANDS
    const q = query.toLowerCase()
    return SLASH_COMMANDS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.value.toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0)
  }, [query])

  if (!editor) return null

  return (
    <EditorCommand className={className ?? "nph-command"}>
      <EditorCommandList
        className="nph-command__list"
        style={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {filteredGroups.length === 0 ? (
          <div style={{ padding: "8px 12px", fontSize: 14, color: "var(--muted-foreground, #6b7280)" }}>
            No commands found
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.group}>
              <div className="nph-command__group-header">{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <EditorCommandItem
                    key={item.value}
                    value={item.value}
                    className="nph-command__item"
                    onCommand={item.onCommand}
                  >
                    <div className="nph-command__item-icon">
                      <Icon size={18} />
                    </div>
                    <div className="nph-command__item-content">
                      <span className="nph-command__item-title">{item.label}</span>
                      <span className="nph-command__item-description">{item.description}</span>
                    </div>
                  </EditorCommandItem>
                )
              })}
            </div>
          ))
        )}
      </EditorCommandList>
    </EditorCommand>
  )
}

export default SlashMenu
