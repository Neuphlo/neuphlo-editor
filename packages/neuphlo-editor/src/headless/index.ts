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
export { EditorCommandItem } from "./components/editor-command-item"

export {
  Command as SlashCommand,
  renderItems as renderSlashCommandItems,
  createSuggestionItems,
  handleCommandNavigation,
} from "./extensions/slash-command"
export type { SuggestionItem } from "./extensions/slash-command"
export { Placeholder } from "./extensions"
