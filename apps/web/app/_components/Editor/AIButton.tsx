import { Sparkles } from "lucide-react"
import type { Editor } from "@tiptap/react"

export const AIButton = (editor: Editor) => {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        console.log("AI Button clicked")
        // Here you would implement your AI logic
        // For example: open a dialog, call an API, etc.
        const selection = editor.state.selection
        const text = editor.state.doc.textBetween(selection.from, selection.to)
        console.log("Selected text:", text)
        alert(`AI Feature triggered for: "${text}"`)
      }}
      className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon text-purple-500 hover:text-purple-600 hover:bg-purple-50"
      aria-label="AI Assistant"
      title="AI Assistant"
    >
      <Sparkles className="size-4" />
    </button>
  )
}
