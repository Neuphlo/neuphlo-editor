import { useCurrentEditor, useEditorState } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconArrowBackUp,
} from "@tabler/icons-react"
import { MenuList } from "./MenuList"
import { LinkPopover } from "./LinkPopover"

export type TextMenuProps = {
  className?: string
}

export function TextMenu({ className }: TextMenuProps) {
  const { editor } = useCurrentEditor()

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null
      return {
        isBold: ctx.editor.isActive("bold"),
        isItalic: ctx.editor.isActive("italic"),
        isStrike: ctx.editor.isActive("strike"),
        isCode: ctx.editor.isActive("code"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isParagraph: ctx.editor.isActive("paragraph"),
        isHeading: ctx.editor.isActive("heading"),
        isList:
          ctx.editor.isActive("bulletList") ||
          ctx.editor.isActive("orderedList"),
        isBlockquote: ctx.editor.isActive("blockquote"),
      }
    },
  })

  if (!editor || !editorState) return null

  const hasAnyMarksInSelection = () => {
    const anyEditor: any = editor
    const state = anyEditor.state
    const sel: any = state.selection
    let has = false
    state.doc.nodesBetween(sel.from, sel.to, (node: any) => {
      if (node.isText && node.marks && node.marks.length > 0) {
        has = true
        return false
      }
      return undefined
    })
    if (!has && sel.empty) {
      const marks = state.storedMarks || sel.$from.marks()
      if (marks && marks.length > 0) has = true
    }
    return has
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ from, to }) => {
        return from !== to
      }}
    >
      <div className={className ? `bubble-menu ${className}` : "bubble-menu"}>
        <MenuList editor={editor} />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editorState.isBold ? " is-active" : ""}`}
          disabled={editorState.isCode || editorState.isCodeBlock}
          aria-disabled={editorState.isCode || editorState.isCodeBlock}
          aria-pressed={editorState.isBold}
          aria-label="Toggle bold"
        >
          <IconBold size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editorState.isItalic ? " is-active" : ""}`}
          disabled={editorState.isCode || editorState.isCodeBlock}
          aria-disabled={editorState.isCode || editorState.isCodeBlock}
          aria-pressed={editorState.isItalic}
          aria-label="Toggle italic"
        >
          <IconItalic size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editorState.isStrike ? " is-active" : ""}`}
          disabled={editorState.isCode || editorState.isCodeBlock}
          aria-disabled={editorState.isCode || editorState.isCodeBlock}
          aria-pressed={editorState.isStrike}
          aria-label="Toggle strike"
        >
          <IconStrikethrough size={16} />
        </button>

        <LinkPopover editor={editor} hideWhenUnavailable={false} />

        {(() => {
          const hasInlineMarks = hasAnyMarksInSelection()

          const isPlainParagraph =
            editorState.isParagraph &&
            !editorState.isHeading &&
            !editorState.isList &&
            !editorState.isBlockquote &&
            !editorState.isCodeBlock &&
            !hasInlineMarks

          return (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .clearNodes()
                  .setParagraph()
                  .unsetAllMarks()
                  .run()
              }
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
    </BubbleMenu>
  )
}

export default TextMenu
