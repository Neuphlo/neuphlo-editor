import {
  EditorRoot,
  EditorContent,
  handleCommandNavigation,
  type EditorContentProps,
} from "../headless"
import type { EditorBubbleProps } from "../headless/components/editor-bubble"
import ExtensionKit from "../headless/extensions/extension-kit"
import { SlashMenu, TextMenu } from "./menus"

type BubbleOverrides = Omit<EditorBubbleProps, "children" | "className">

export type NeuphloEditorProps = {
  content?: string
  className?: string
  editable?: boolean
  immediatelyRender?: boolean
  showTextMenu?: boolean
  showSlashMenu?: boolean
  bubbleMenuOptions?: BubbleOverrides["options"]
  bubbleMenuProps?: BubbleOverrides
  extensions?: any[]
  onUpdate?: EditorContentProps["onUpdate"]
  onCreate?: EditorContentProps["onCreate"]
}

export function Editor({
  content,
  className,
  editable = true,
  immediatelyRender = false,
  showTextMenu = true,
  showSlashMenu = true,
  bubbleMenuOptions,
  bubbleMenuProps,
  extensions,
  onUpdate,
  onCreate,
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
          {showTextMenu ? (
            <TextMenu
              options={bubbleMenuOptions}
              bubbleProps={bubbleMenuProps}
            />
          ) : null}
          {showSlashMenu ? <SlashMenu /> : null}
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
