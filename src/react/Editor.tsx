import * as React from "react"
import { EditorProvider } from "@tiptap/react"
import type { EditorProviderProps } from "@tiptap/react"
import type { Extension, Content } from "@tiptap/core"
import { NeuphloPreset } from "../preset"
import { cn } from "./utils/cn"

export type EditorProps = Omit<EditorProviderProps, 'children' | 'slotBefore' | 'slotAfter'> & {
  /**
   * Opt-in to package styles by adding class "nph-editor".
   * Pair with: import 'neuphlo-editor/styles.css'
   */
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
  const mergedContainerProps = React.useMemo(() => {
    const mergedClassName = cn(styled && "nph-editor", editorContainerProps?.className)
    return { ...editorContainerProps, className: mergedClassName }
  }, [editorContainerProps, styled])

  const mergedEditorProps = React.useMemo(() => {
    const attrs = {
      ...editorProps?.attributes,
      ...(!editable ? { 'aria-disabled': 'true', 'data-disabled': 'true' } : {}),
    } as Record<string, string>
    return { ...editorProps, attributes: attrs }
  }, [editorProps, editable])

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
