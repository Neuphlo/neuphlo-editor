import * as React from "react"
import { EditorProvider } from "@tiptap/react"
import type { EditorProviderProps } from "@tiptap/react"
import { NeuphloPreset } from "../preset"
import { cn } from "./utils/cn"

export type EditorProps = Omit<
  EditorProviderProps,
  "children" | "slotBefore" | "slotAfter"
> & {
  styled?: boolean
  children?: React.ReactNode
}

export function Editor({
  styled,
  editorContainerProps,
  extensions = [],
  content,
  onUpdate,
  editorProps,
  editable = true,
  children,
  ...rest
}: EditorProps) {
  const mergedContainerProps = {
    ...editorContainerProps,
    className: cn(styled && "nph-editor", editorContainerProps?.className),
  }

  const mergedEditorProps = {
    ...editorProps,
    attributes: {
      ...editorProps?.attributes,
      ...(!editable ? { 'aria-disabled': 'true', 'data-disabled': 'true' } : {}),
    } as Record<string, string>,
  }

  return (
    <EditorProvider
      content={content}
      extensions={[...NeuphloPreset, ...(extensions ?? [])]}
      onUpdate={onUpdate}
      editorProps={mergedEditorProps}
      editable={editable}
      editorContainerProps={mergedContainerProps}
      {...rest}
    >
      {children}
    </EditorProvider>
  )
}
