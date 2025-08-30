import type { Extension } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"

export const Preset: Extension[] = [
  StarterKit.configure({
    bulletList: { keepMarks: true },
    orderedList: { keepMarks: true },
    heading: { levels: [1, 2, 3, 4] },
  }),
]
