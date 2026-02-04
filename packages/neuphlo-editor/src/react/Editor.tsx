import {
  EditorRoot,
  EditorContent,
  handleCommandNavigation,
  type EditorContentProps,
} from "../headless"
import ExtensionKit from "../headless/extensions/extension-kit"
import type { MentionOptions } from "../headless/extensions"
import { SlashMenu, TextMenu } from "./menus"
import { ImageMenu } from "./menus/ImageMenu"
import { LinkMenu } from "./menus/LinkMenu"
import { ImageBlockView } from "./menus/ImageBlock/ImageBlockView"
import type { ReactNode } from "react"
import type { Editor as TiptapEditor } from "@tiptap/react"

export type BubbleMenuExtraRenderer = (editor: TiptapEditor) => ReactNode

export type BubbleMenuExtra =
  | BubbleMenuExtraRenderer
  | {
    render: BubbleMenuExtraRenderer
    align?: "start" | "end"
  }

export type BubbleMenuExtras = Partial<{
  text: BubbleMenuExtra | BubbleMenuExtra[]
  image: BubbleMenuExtra | BubbleMenuExtra[]
}>

export type NeuphloEditorProps = {
  content?: string
  className?: string
  editable?: boolean
  immediatelyRender?: boolean
  showTextMenu?: boolean
  showSlashMenu?: boolean
  showImageMenu?: boolean
  extensions?: any[]
  bubbleMenuExtras?: BubbleMenuExtras
  onUpdate?: EditorContentProps["onUpdate"]
  onCreate?: EditorContentProps["onCreate"]
  uploadImage?: (file: File) => Promise<string>
  collaboration?: {
    doc: any
    field: string
    awareness?: any
  }
  mentionOptions?: MentionOptions
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
  bubbleMenuExtras,
  onUpdate,
  onCreate,
  uploadImage,
  collaboration,
  mentionOptions,
}: NeuphloEditorProps) {
  const normalizeExtras = (extras?: BubbleMenuExtra | BubbleMenuExtra[]) => {
    const result: {
      start: BubbleMenuExtraRenderer[]
      end: BubbleMenuExtraRenderer[]
    } = {
      start: [],
      end: [],
    }
    if (!extras) return result

    const list = Array.isArray(extras) ? extras : [extras]
    list.forEach((item) => {
      const config =
        typeof item === "function"
          ? { render: item, align: "end" as const }
          : item
      const slot = config.align === "start" ? "start" : "end"
      result[slot].push(config.render)
    })
    return result
  }

  const textExtras = normalizeExtras(bubbleMenuExtras?.text)
  const imageExtras = normalizeExtras(bubbleMenuExtras?.image)

  return (
    <div className={className}>
      <EditorRoot>
        <EditorContent
          onUpdate={onUpdate}
          onCreate={onCreate}
          immediatelyRender={immediatelyRender}
          editable={editable}
          content={content}
          extensions={[
            ...
            ExtensionKit({
              uploadImage: uploadImage,
              collaboration: collaboration,
              imageBlockView: ImageBlockView,
              mention: mentionOptions,
            }),
            ...(extensions ?? []),
          ]}
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
              leadingExtras={textExtras.start}
              trailingExtras={textExtras.end}
            />
          ) : null}
          {showImageMenu ? (
            <ImageMenu
              leadingExtras={imageExtras.start}
              trailingExtras={imageExtras.end}
            />
          ) : null}
          <LinkMenu />
          {showSlashMenu ? <SlashMenu /> : null}
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
