import StarterKit from "@tiptap/starter-kit"
import { EditorRoot, EditorContent, EditorBubble } from "../headless"
import { useCurrentEditor } from "@tiptap/react"
import { useEffect, useState } from "react"

export type NeuphloEditorProps = {
  content?: string
  className?: string
  editable?: boolean
  immediatelyRender?: boolean
  showBubbleMenu?: boolean
  bubbleMenuOptions?: Record<string, unknown>
}

export function Editor({
  content,
  className,
  editable = true,
  immediatelyRender = false,
  showBubbleMenu = true,
  bubbleMenuOptions,
}: NeuphloEditorProps) {
  function DefaultBubble() {
    const { editor } = useCurrentEditor()
    if (!editor) return null

    const [, setTick] = useState(0)
    useEffect(() => {
      const rerender = () => setTick((t) => (t + 1) % 1000)
      editor.on("selectionUpdate", rerender)
      editor.on("transaction", rerender)
      editor.on("update", rerender)
      return () => {
        editor.off("selectionUpdate", rerender)
        editor.off("transaction", rerender)
        editor.off("update", rerender)
      }
    }, [editor])

    return (
      <EditorBubble
        options={{
          placement: "bottom",
          offset: 8,
          ...(bubbleMenuOptions ?? {}),
        }}
      >
        <div className="bubble-menu">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("bold") ? " is-active" : ""}`}
            aria-pressed={editor.isActive("bold")}
            aria-label="Toggle bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("italic") ? " is-active" : ""}`}
            aria-pressed={editor.isActive("italic")}
            aria-label="Toggle italic"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${editor.isActive("strike") ? " is-active" : ""}`}
            aria-pressed={editor.isActive("strike")}
            aria-label="Toggle strike"
          >
            S
          </button>
        </div>
      </EditorBubble>
    )
  }

  return (
    <div className={className}>
      <EditorRoot>
        <EditorContent
          immediatelyRender={immediatelyRender}
          editable={editable}
          content={content}
          extensions={[StarterKit.configure({})]}
          editorProps={{
            attributes: { class: "nph-editor max-w-none outline-none" },
          }}
        >
          {showBubbleMenu ? <DefaultBubble /> : null}
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
