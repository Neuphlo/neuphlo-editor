import { useCurrentEditor, useEditorState } from "@tiptap/react"
import type { Editor as TiptapEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconArrowBackUp,
} from "@tabler/icons-react"
import type { ReactNode } from "react"
import { Fragment } from "react"
import { MenuList } from "./MenuList"
import { LinkPopover } from "./LinkPopover"

type ExtraRenderer = (editor: TiptapEditor) => ReactNode

export type TextMenuProps = {
  className?: string
  leadingExtras?: ExtraRenderer[]
  trailingExtras?: ExtraRenderer[]
}

export function TextMenu({
  className,
  leadingExtras,
  trailingExtras,
}: TextMenuProps) {
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
      shouldShow={({ editor: e, state, from, to, view }) => {
        // Don't show if imageBlock is active
        if (e.isActive("imageBlock")) return false

        // Don't show for node selections
        const { selection } = state
        if (selection.constructor.name === "NodeSelection") return false

        // Don't show if selection is empty
        if (from === to) return false

        // Check if the selection contains an imageBlock node
        let hasImage = false
        state.doc.nodesBetween(from, to, (node) => {
          if (node.type.name === "imageBlock") {
            hasImage = true
            return false
          }
        })
        if (hasImage) return false

        // Show only for text selections
        return true
      }}
    >
      <div className={className ? `bubble-menu ${className}` : "bubble-menu"}>
        {leadingExtras && editor
          ? leadingExtras.map((renderExtra, index) => (
              <Fragment key={`leading-extra-${index}`}>
                {renderExtra(editor)}
              </Fragment>
            ))
          : null}
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
        {trailingExtras && editor
          ? trailingExtras.map((renderExtra, index) => (
              <Fragment key={`trailing-extra-${index}`}>
                {renderExtra(editor)}
              </Fragment>
            ))
          : null}
      </div>
    </BubbleMenu>
  )
}

export default TextMenu
