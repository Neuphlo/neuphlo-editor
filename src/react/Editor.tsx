import * as React from "react"
import { EditorProvider } from "@tiptap/react"
import type { EditorProviderProps } from "@tiptap/react"
import { Preset } from "../preset"
import { cn } from "./utils/cn"

export type EditorProps = Omit<
  EditorProviderProps,
  "children" | "slotBefore" | "slotAfter" | "editorContainerProps"
> & {
  styled?: boolean
  className?: string
  editorContainerProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "className">
  children?: React.ReactNode
}

export function Editor({
  styled,
  className,
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
    className: cn(styled && "nph-editor", className),
  }

  const mergedEditorProps = {
    ...editorProps,
    attributes: {
      ...editorProps?.attributes,
      ...(!editable
        ? { "aria-disabled": "true", "data-disabled": "true" }
        : {}),
    } as Record<string, string>,
  }

  return (
    <EditorProvider
      content={content}
      extensions={[...Preset, ...(extensions ?? [])]}
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
