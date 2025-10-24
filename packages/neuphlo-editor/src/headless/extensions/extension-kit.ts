import { StarterKit, Placeholder, CodeBlock, Link } from "."
import {
  Command as SlashCommand,
  renderItems as renderSlashItems,
} from "./slash-command"
import { ImageBlock } from "./ImageBlock/ImageBlock"

export interface ExtensionKitOptions {
  uploadImage?: (file: File) => Promise<string>
}

export const ExtensionKit = (options?: ExtensionKitOptions) => [
  StarterKit.configure({}),
  CodeBlock,
  Link,
  ImageBlock.configure({
    uploadImage: options?.uploadImage,
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

export default ExtensionKit
