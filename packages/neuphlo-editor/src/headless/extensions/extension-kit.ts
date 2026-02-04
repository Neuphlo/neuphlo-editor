import Collaboration from "@tiptap/extension-collaboration"
// import CollaborationCursor from "@tiptap/extension-collaboration-cursor" // Temporarily disabled
import { StarterKit, Placeholder, CodeBlock, Link } from "."
import {
  Command as SlashCommand,
  renderItems as renderSlashItems,
} from "./slash-command"
import { ImageBlock } from "./ImageBlock/ImageBlock"
import { createMentionExtension } from "./Mention"
import type { MentionOptions } from "./Mention"

export interface ExtensionKitOptions {
  uploadImage?: (file: File) => Promise<string>
  collaboration?: {
    doc: any
    field: string
    awareness?: any
    user?: any
  }
  imageBlockView?: any
  mention?: MentionOptions
  reference?: MentionOptions
}

export const ExtensionKit = (options?: ExtensionKitOptions) => {
  const extensions = [
    StarterKit.configure({ codeBlock: false, link: false }),
    CodeBlock,
    Link,
    ImageBlock.configure({
      uploadImage: options?.uploadImage,
      nodeView: options?.imageBlockView,
    }),
    Placeholder.configure({
      placeholder: ({ node }: any) => {
        if (node.type.name === "heading") {
          return `Heading ${node.attrs.level}`
        }
        return "Press '/' for commands"
      },
      includeChildren: true,
    }),
    SlashCommand.configure({
      suggestion: {
        char: "/",
        render: renderSlashItems,
        allowSpaces: true,
        allowedPrefixes: null,
      },
    }),
  ]

  // Add Mention extension if configured
  if (options?.mention) {
    const mentionExt = createMentionExtension(options.mention)
    extensions.push(mentionExt)
  }

  // Add Reference extension if configured (uses same Mention extension with different config)
  if (options?.reference) {
    const referenceExt = createMentionExtension(options.reference)
    extensions.push(referenceExt)
  }

  if (options?.collaboration?.doc) {
    extensions.push(
      Collaboration.configure({
        document: options.collaboration.doc,
        field: options.collaboration.field,
      }),
    )

    // Note: CollaborationCursor is temporarily disabled due to compatibility issues
    // Collaboration (document syncing) still works without it
    // TODO: Fix CollaborationCursor integration
  }

  return extensions
}

export default ExtensionKit
