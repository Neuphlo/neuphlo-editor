import { StarterKit, Placeholder, CodeBlock } from "."
import {
  Command as SlashCommand,
  renderItems as renderSlashItems,
} from "./slash-command"

export const ExtensionKit = () => [
  StarterKit.configure({}),
  CodeBlock,
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
    },
  }),
]

export default ExtensionKit
