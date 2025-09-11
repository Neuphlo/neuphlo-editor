import { EditorRoot, EditorContent, handleCommandNavigation } from "../headless"
import ExtensionKit from "../headless/extensions/extension-kit"
import { SlashMenu, TextMenu } from "./menus"

export type NeuphloEditorProps = {
  content?: string
  className?: string
  editable?: boolean
  immediatelyRender?: boolean
  showTextMenu?: boolean
  showSlashMenu?: boolean
  bubbleMenuOptions?: Record<string, unknown>
  extensions?: any[]
}

export function Editor({
  content,
  className,
  editable = true,
  immediatelyRender = false,
  showTextMenu = true,
  showSlashMenu = true,
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
            attributes: {
              class: "nph-editor max-w-none outline-none",
            },
            handleKeyDown: (view, event) => {
              return !!handleCommandNavigation?.(event as any)
            },
          }}
        >
          {showTextMenu ? <TextMenu /> : null}
          {showSlashMenu ? <SlashMenu /> : null}
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
