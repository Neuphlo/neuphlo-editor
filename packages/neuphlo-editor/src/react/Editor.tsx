import { EditorProvider } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export type NeuphloEditorProps = {
  content?: string
  className?: string
  editable?: boolean
}

export function Editor({
  content = "<p>Hello Neuphlo</p>",
  className,
  editable = true,
}: NeuphloEditorProps) {
  return (
    <div className={className}>
      <EditorProvider
        immediatelyRender={false}
        slotBefore={null}
        slotAfter={null}
        editable={editable}
        content={content}
        extensions={[StarterKit.configure({})]}
        editorProps={{
          attributes: { class: "nph-editor max-w-none outline-none" },
        }}
      />
    </div>
  )
}
