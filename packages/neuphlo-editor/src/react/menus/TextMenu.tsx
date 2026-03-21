import { NodeSelection } from "@tiptap/pm/state"
import { useCurrentEditor, useEditorState } from "@tiptap/react"
import type { Editor as TiptapEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconArrowBackUp,
  IconLink,
  IconCheck,
  IconX,
} from "@tabler/icons-react"
import type { ReactNode } from "react"
import { Fragment, useState, useRef, useEffect } from "react"
import { MenuList } from "./MenuList"

type ExtraRenderer = (editor: TiptapEditor) => ReactNode

export type TextMenuProps = {
  className?: string
  leadingExtras?: ExtraRenderer[]
  trailingExtras?: ExtraRenderer[]
}

function Separator() {
  return <div className="nph-bubble-separator" />
}

export function TextMenu({
  className,
  leadingExtras,
  trailingExtras,
}: TextMenuProps) {
  const { editor } = useCurrentEditor()
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const linkInputRef = useRef<HTMLInputElement | null>(null)

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null
      return {
        isBold: ctx.editor.isActive("bold"),
        isItalic: ctx.editor.isActive("italic"),
        isUnderline: ctx.editor.isActive("underline"),
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

  useEffect(() => {
    if (isAddingLink && linkInputRef.current) {
      linkInputRef.current.focus()
    }
  }, [isAddingLink])

  if (!editor || !editorState) return null

  const handleSetLink = () => {
    if (!linkUrl) return
    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    setIsAddingLink(false)
    setLinkUrl("")
  }

  const handleCancelLink = () => {
    setIsAddingLink(false)
    setLinkUrl("")
    editor.chain().focus().run()
  }

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

  const isInCode = editorState.isCode || editorState.isCodeBlock

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e, state, from, to, view }) => {
        // Don't show if imageBlock or videoBlock is active
        if (e.isActive("imageBlock")) return false
        if (e.isActive("videoBlock")) return false

        // Don't show for node selections
        const { selection } = state
        if (selection instanceof NodeSelection) return false

        // Don't show if selection is empty
        if (from === to) return false

        // Don't show if link is active (LinkMenu will handle this)
        if (e.isActive("link")) return false

        // Check if the selection contains an imageBlock node
        let hasImage = false
        state.doc.nodesBetween(from, to, (node) => {
          if (node.type.name === "imageBlock" || node.type.name === "videoBlock") {
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
        <Separator />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editorState.isBold ? " is-active" : ""}`}
          disabled={isInCode}
          aria-disabled={isInCode}
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
          disabled={isInCode}
          aria-disabled={isInCode}
          aria-pressed={editorState.isItalic}
          aria-label="Toggle italic"
        >
          <IconItalic size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editorState.isUnderline ? " is-active" : ""}`}
          disabled={isInCode}
          aria-disabled={isInCode}
          aria-pressed={editorState.isUnderline}
          aria-label="Toggle underline"
        >
          <IconUnderline size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editorState.isStrike ? " is-active" : ""}`}
          disabled={isInCode}
          aria-disabled={isInCode}
          aria-pressed={editorState.isStrike}
          aria-label="Toggle strike"
        >
          <IconStrikethrough size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editorState.isCode ? " is-active" : ""}`}
          disabled={editorState.isCodeBlock}
          aria-disabled={editorState.isCodeBlock}
          aria-pressed={editorState.isCode}
          aria-label="Toggle inline code"
        >
          <IconCode size={16} />
        </button>
        <Separator />
        {!isAddingLink ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsAddingLink(true)}
            className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("link") ? " is-active" : ""}`}
            disabled={isInCode}
            aria-disabled={isInCode}
            aria-pressed={editor.isActive("link")}
            aria-label="Add link"
          >
            <IconLink size={16} />
          </button>
        ) : (
          <>
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSetLink()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  handleCancelLink()
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
              disabled={!linkUrl}
            >
              <IconCheck size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCancelLink}
              className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
              aria-label="Cancel"
              title="Cancel"
            >
              <IconX size={16} />
            </button>
          </>
        )}

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
            <>
              <Separator />
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
            </>
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
