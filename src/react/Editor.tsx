import * as React from "react"
import { EditorProvider } from "@tiptap/react"
import type { Extension, Content } from "@tiptap/core"
import { NeuphloPreset } from "../preset"
import { cn } from "./utils/cn"

export type EditorProps = React.HTMLAttributes<HTMLDivElement> & {
  content?: Content
  extensions?: Extension[]
  onUpdate?: Parameters<typeof EditorProvider>[0]["onUpdate"]
  editorProps?: Parameters<typeof EditorProvider>[0]["editorProps"]
  styled?: boolean
  children?: React.ReactNode
}

export function Editor({
  content,
  extensions = [],
  onUpdate,
  editorProps,
  styled,
  children,
  ...props
}: EditorProps) {
  const editorContainerProps = React.useMemo(() => {
    const mergedClassName = cn(styled && "nph-editor", props.className)
    return { ...props, className: mergedClassName }
  }, [props, styled])

  return (
    <EditorProvider
      content={content}
      extensions={[...NeuphloPreset, ...(extensions ?? [])]}
      onUpdate={onUpdate}
      editorProps={editorProps}
      editorContainerProps={editorContainerProps}
    >
      {children}
    </EditorProvider>
  )
}
