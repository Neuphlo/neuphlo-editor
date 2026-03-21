import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCaret from "@tiptap/extension-collaboration-caret"
import { StarterKit, Placeholder, CodeBlock, Link } from "."
import Underline from "@tiptap/extension-underline"
import {
  Command as SlashCommand,
} from "./slash-command"
import { ImageBlock } from "./ImageBlock/ImageBlock"
import { VideoBlock } from "./VideoBlock/VideoBlock"
import { createMentionExtension } from "./Mention"
import type { MentionOptions } from "./Mention"
import { DragHandle, setDragHandleCallbacks } from "./DragHandle"
import type { DragHandleCallbacks } from "./DragHandle"
import { TableKit } from "./Table"
import { MarkdownPaste } from "./MarkdownPaste"

export interface ExtensionKitOptions {
  uploadImage?: (file: File) => Promise<string>
  collaboration?: {
    doc: any
    field: string
    awareness?: any
    provider?: any
    user?: { name: string; color: string; [key: string]: any }
  }
  imageBlockView?: any
  videoBlockView?: any
  mention?: MentionOptions
  reference?: MentionOptions
  slashCommand?: boolean
  dragHandle?: boolean
  dragHandleCallbacks?: DragHandleCallbacks
  table?: boolean
  placeholder?: string
}

export const ExtensionKit = (options?: ExtensionKitOptions) => {
  const enableSlashCommand = options?.slashCommand !== false // Default to true

  const extensions = [
    StarterKit.configure({ codeBlock: false, link: false }),
    CodeBlock,
    Link,
    Underline,
    ImageBlock.configure({
      uploadImage: options?.uploadImage,
      nodeView: options?.imageBlockView,
    }),
    VideoBlock.configure({
      nodeView: options?.videoBlockView,
    }),
    Placeholder.configure({
      placeholder: ({ node }: any) => {
        if (node.type.name === "heading") {
          return `Heading ${node.attrs.level}`
        }
        // Use custom placeholder if provided, otherwise show slash command hint if enabled
        if (options?.placeholder) {
          return options.placeholder
        }
        return enableSlashCommand ? "Press '/' for commands" : ""
      },
      includeChildren: true,
    }),
    MarkdownPaste,
  ]

  // Add Table support if enabled
  if (options?.table !== false) {
    extensions.push(
      TableKit.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }) as any
    )
  }

  // Add DragHandle if enabled
  if (options?.dragHandle !== false) {
    extensions.push(DragHandle as any)
    if (options?.dragHandleCallbacks) {
      setDragHandleCallbacks(options.dragHandleCallbacks)
    }
  }

  // Add SlashCommand if enabled
  if (enableSlashCommand) {
    extensions.push(
      SlashCommand.configure({
        suggestion: {
          char: "/",
          allowSpaces: true,
          allowedPrefixes: null,
        },
      })
    )
  }

  // Add Mention extension if configured
  if (options?.mention) {
    const mentionExt = createMentionExtension(options.mention)
    extensions.push(mentionExt)
  }

  // Add Reference extension if configured (uses same Mention extension with different config)
  if (options?.reference) {
    const referenceExt = createMentionExtension({
      ...options.reference,
      name: "reference", // Use unique name to avoid conflicts
    })
    extensions.push(referenceExt)
  }

  if (options?.collaboration?.doc) {
    extensions.push(
      Collaboration.configure({
        document: options.collaboration.doc,
        field: options.collaboration.field,
      }),
    )

    // Add collaboration carets if provider and user are available
    if (options.collaboration.provider && options.collaboration.user) {
      extensions.push(
        CollaborationCaret.configure({
          provider: options.collaboration.provider,
          user: options.collaboration.user,
          render: (user: Record<string, any>) => {
            const cursor = document.createElement("span")
            cursor.classList.add("nph-collab-caret")
            cursor.setAttribute("style", `border-color: ${user.color || "#3b82f6"}`)

            const label = document.createElement("div")
            label.classList.add("nph-collab-caret__label")
            label.setAttribute("style", `background-color: ${user.color || "#3b82f6"}`)
            label.insertBefore(document.createTextNode(user.name || "Anonymous"), null)

            cursor.insertBefore(label, null)
            return cursor
          },
          selectionRender: (user: Record<string, any>) => ({
            nodeName: "span",
            class: "nph-collab-selection",
            style: `background-color: ${user.color || "#3b82f6"}20`,
          }),
        }) as any
      )
    }
  }

  return extensions
}

export default ExtensionKit
