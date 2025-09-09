import StarterKit from "@tiptap/starter-kit"
import { EditorRoot, EditorContent } from "../headless"
import { defaultExtensions } from "../headless/extensions"
import { TextMenu } from "./menus"

export type NeuphloEditorProps = {
  content?: string
  className?: string
  editable?: boolean
  immediatelyRender?: boolean
  showTextMenu?: boolean
  bubbleMenuOptions?: Record<string, unknown>
  extensions?: any[]
}

export function Editor({
  content,
  className,
  editable = true,
  immediatelyRender = false,
  showTextMenu = true,
  extensions,
}: NeuphloEditorProps) {
  return (
    <div className={className}>
      <EditorRoot>
        <EditorContent
          immediatelyRender={immediatelyRender}
          editable={editable}
          content={content}
          extensions={
            [
              StarterKit.configure({}),
              ...defaultExtensions,
              ...(extensions ?? []),
            ] as any
          }
          editorProps={{
            attributes: { class: "nph-editor max-w-none outline-none" },
          }}
        >
          {showTextMenu ? <TextMenu /> : null}
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
