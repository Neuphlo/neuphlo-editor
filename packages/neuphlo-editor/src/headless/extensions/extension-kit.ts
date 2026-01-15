import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
import { StarterKit, Placeholder, CodeBlock, Link } from "."
import {
  Command as SlashCommand,
  renderItems as renderSlashItems,
} from "./slash-command"
import { ImageBlock } from "./ImageBlock/ImageBlock"

export interface ExtensionKitOptions {
  uploadImage?: (file: File) => Promise<string>
  collaboration?: {
    doc: any
    field: string
    awareness?: any
    user?: any
  }
  imageBlockView?: any
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

  if (options?.collaboration?.doc) {
    extensions.push(
      Collaboration.configure({
        document: options.collaboration.doc,
        field: options.collaboration.field,
      }),
    )

    if (options.collaboration.awareness) {
      extensions.push(
        CollaborationCursor.configure({
          provider: options.collaboration.awareness,
        }),
      )
    }
  }

  return extensions
}

export default ExtensionKit
