import { forwardRef } from "react"
import { useCurrentEditor } from "@tiptap/react"
import { useAtomValue } from "jotai"
import { rangeAtom, queryAtom } from "../utils/atoms"
import { novelStore } from "../utils/store"
import type { Editor, Range } from "@tiptap/core"

interface EditorCommandItemProps {
  readonly onCommand: ({
    editor,
    range,
  }: {
    editor: Editor
    range: Range
  }) => void
  readonly value?: string
}

export const EditorCommandItem = forwardRef<
  HTMLDivElement,
  EditorCommandItemProps & any
>(({ children, onCommand, value, className, ...rest }, ref) => {
  const { editor } = useCurrentEditor()
  const range = useAtomValue(rangeAtom, { store: novelStore })
  const query = useAtomValue(queryAtom, { store: novelStore })

  if (!editor || !range) return null

  // Filter: if query is set, check if this item matches
  if (query && value) {
    const searchText = value.toLowerCase()
    const q = query.toLowerCase()
    if (!searchText.includes(q)) return null
  }

  return (
    <div
      ref={ref}
      role="option"
      className={className}
      onClick={() => onCommand({ editor, range })}
      {...rest}
    >
      {children}
    </div>
  )
})

EditorCommandItem.displayName = "EditorCommandItem"

export const EditorCommandEmpty = forwardRef<HTMLDivElement, any>(
  ({ children, ...rest }, ref) => {
    return (
      <div ref={ref} {...rest}>
        {children}
      </div>
    )
  }
)

EditorCommandEmpty.displayName = "EditorCommandEmpty"

export default EditorCommandItem
