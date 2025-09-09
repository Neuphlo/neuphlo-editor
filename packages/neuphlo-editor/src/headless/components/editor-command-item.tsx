import { forwardRef } from "react"
import { CommandEmpty, CommandItem } from "cmdk"
import { useCurrentEditor } from "@tiptap/react"
import { useAtomValue } from "jotai"
import { rangeAtom } from "../utils/atoms"
import type { Editor, Range } from "@tiptap/core"

interface EditorCommandItemProps {
  readonly onCommand: ({
    editor,
    range,
  }: {
    editor: Editor
    range: Range
  }) => void
}

const CommandItemAny: any = CommandItem
const CommandEmptyAny: any = CommandEmpty

export const EditorCommandItem = forwardRef<
  HTMLDivElement,
  EditorCommandItemProps & any
>(({ children, onCommand, ...rest }, ref) => {
  const { editor } = useCurrentEditor()
  const range = useAtomValue(rangeAtom)

  if (!editor || !range) return null

  return (
    <CommandItemAny
      ref={ref}
      {...(rest as any)}
      onSelect={() => onCommand({ editor, range })}
    >
      {children}
    </CommandItemAny>
  )
})

EditorCommandItem.displayName = "EditorCommandItem"

export const EditorCommandEmpty: any = CommandEmptyAny

export default EditorCommandItem
