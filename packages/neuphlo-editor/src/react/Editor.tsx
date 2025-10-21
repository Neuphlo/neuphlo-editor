import {
  EditorRoot,
  EditorContent,
  handleCommandNavigation,
  type EditorContentProps,
} from "../headless"
import ExtensionKit from "../headless/extensions/extension-kit"
import { SlashMenu, TextMenu, ImageMenu } from "./menus"

export type NeuphloEditorProps = {
  content?: string
  className?: string
  editable?: boolean
  immediatelyRender?: boolean
  showTextMenu?: boolean
  showSlashMenu?: boolean
  showImageMenu?: boolean
  extensions?: any[]
  onUpdate?: EditorContentProps["onUpdate"]
  onCreate?: EditorContentProps["onCreate"]
  uploadImage?: (file: File) => Promise<string>
}

export function Editor({
  content,
  className,
  editable = true,
  immediatelyRender = false,
  showTextMenu = true,
  showSlashMenu = true,
  showImageMenu = true,
  extensions,
  onUpdate,
  onCreate,
  uploadImage,
}: NeuphloEditorProps) {
  return (
    <div className={className}>
      <EditorRoot>
        <EditorContent
          onUpdate={onUpdate}
          onCreate={onCreate}
          immediatelyRender={immediatelyRender}
          editable={editable}
          content={content}
          extensions={[...ExtensionKit({ uploadImage }), ...(extensions ?? [])]}
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
          {showImageMenu ? <ImageMenu /> : null}
          {showSlashMenu ? <SlashMenu /> : null}
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
