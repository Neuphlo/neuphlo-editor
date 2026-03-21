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
import { VideoBlockView } from "./menus/VideoBlock/VideoBlockView"
import type { ReactNode } from "react"
import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import type { Editor as TiptapEditor } from "@tiptap/react"
import { BlockActionMenu } from "./menus/DragHandle/BlockActionMenu"
import { TableMenu } from "./menus/TableMenu"

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
  showDragHandle?: boolean
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
  referenceOptions?: MentionOptions
  slashCommand?: boolean
  placeholder?: string
}

export function Editor({
  content,
  className,
  editable = true,
  immediatelyRender = false,
  showTextMenu = true,
  showSlashMenu = true,
  showImageMenu = false,
  showDragHandle = true,
  extensions,
  bubbleMenuExtras,
  onUpdate,
  onCreate,
  uploadImage,
  collaboration,
  mentionOptions,
  referenceOptions,
  slashCommand,
  placeholder,
}: NeuphloEditorProps) {
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null)
  const [actionMenuEditor, setActionMenuEditor] = useState<TiptapEditor | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  // Close action menu on click outside
  useEffect(() => {
    if (!actionMenuAnchor) return
    const handlePointerDown = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as HTMLElement)) {
        setActionMenuAnchor(null)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [actionMenuAnchor])

  const dragHandleCallbacks = useMemo(
    () => ({
      onAddBlock: (editor: any) => {
        const { state } = editor
        const { selection } = state
        const { $anchor } = selection

        // Find the top-level block node (depth 1) and insert after it
        const topDepth = Math.min($anchor.depth, 1)
        const endOfBlock = $anchor.end(topDepth)
        const insertPos = endOfBlock + 1

        editor
          .chain()
          .focus()
          .insertContentAt(insertPos, { type: "paragraph" })
          .focus(insertPos + 1)
          .run()
        // Insert "/" to trigger slash command menu after the new paragraph is focused
        requestAnimationFrame(() => {
          editor.commands.insertContent("/")
        })
      },
      onGripClick: (editor: any, _node: any, element: HTMLElement) => {
        setActionMenuEditor(editor)
        setActionMenuAnchor((prev) => (prev === element ? null : element))
      },
    }),
    []
  )

  const enableDragHandle = showDragHandle && editable

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

  const handleCloseActionMenu = useCallback(() => {
    setActionMenuAnchor(null)
  }, [])

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
              videoBlockView: VideoBlockView,
              mention: mentionOptions,
              reference: referenceOptions,
              slashCommand: slashCommand,
              dragHandle: enableDragHandle,
              dragHandleCallbacks: enableDragHandle ? dragHandleCallbacks : undefined,
              placeholder: placeholder,
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
          <TableMenu />
          {showSlashMenu ? <SlashMenu /> : null}
        </EditorContent>
      </EditorRoot>
      {actionMenuAnchor && actionMenuEditor && (
        <div
          ref={actionMenuRef}
          style={{
            position: "fixed",
            zIndex: 10000,
            top: actionMenuAnchor.getBoundingClientRect().bottom + 4,
            left: actionMenuAnchor.getBoundingClientRect().left,
          }}
        >
          <BlockActionMenu
            editor={actionMenuEditor}
            onClose={handleCloseActionMenu}
          />
        </div>
      )}
    </div>
  )
}
