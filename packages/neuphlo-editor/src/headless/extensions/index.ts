import Placeholder from "@tiptap/extension-placeholder"

export * from "./slash-command"

const PlaceholderExtension = Placeholder.configure({
  placeholder: ({ node }: any) => {
    if (node.type.name === "heading") {
      return `Heading ${node.attrs.level}`
    }
    return "Press '/' for commands"
  },
  includeChildren: true,
})

export { PlaceholderExtension as Placeholder }

// Prebuilt, minimal extension set for convenience (static)
export const defaultExtensions = [PlaceholderExtension]
