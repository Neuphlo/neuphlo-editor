import { StarterKit, CodeBlock } from "."

export const Extensions = () => [
  StarterKit.configure({
    bulletList: { keepMarks: true },
    orderedList: { keepMarks: true },
    heading: { levels: [1, 2, 3, 4] },
  }),
  CodeBlock,
]
