import { StarterKit, Placeholder } from "."

export const ExtensionKit = () => [
  StarterKit.configure({}),
  Placeholder.configure({
    placeholder: ({ node }: any) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`
      }
      return "Press '/' for commands"
    },
    includeChildren: true,
  }),
]

export default ExtensionKit
