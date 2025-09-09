import { EditorRoot, EditorContent } from "../headless"
import ExtensionKit from "../headless/extensions/extension-kit"
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
          extensions={[...ExtensionKit(), ...(extensions ?? [])]}
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
