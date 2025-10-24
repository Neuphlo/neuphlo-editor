export { useCurrentEditor as useEditor } from "@tiptap/react"

export {
  EditorRoot,
  EditorContent,
  type EditorContentProps,
} from "./components/editor"

export { EditorBubble } from "./components/editor-bubble"
export { EditorBubbleItem } from "./components/editor-bubble-item"
export {
  EditorCommand,
  EditorCommandList,
  EditorCommandOut,
} from "./components/editor-command"
export {
  EditorCommandItem,
  EditorCommandEmpty,
} from "./components/editor-command-item"

export { Placeholder, StarterKit } from "./extensions"
export {
  Command as SlashCommand,
  renderItems as renderSlashCommandItems,
  createSuggestionItems,
  handleCommandNavigation,
} from "./extensions/slash-command"
// Path without extension to satisfy TS/tsup
// (the file is at ./extensions/slash-command.tsx)
// eslint-disable-next-line
