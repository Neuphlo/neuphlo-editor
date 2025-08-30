import * as React from "react"
import { EditorProvider } from "@tiptap/react"
import type { Extension, Content } from "@tiptap/core"
import { Preset } from "../preset"

export type EditorProps = React.HTMLAttributes<HTMLDivElement> & {
  content?: Content
  extensions?: Extension[]
  onUpdate?: Parameters<typeof EditorProvider>[0]["onUpdate"]
  editorProps?: Parameters<typeof EditorProvider>[0]["editorProps"]
  children?: React.ReactNode
}

export function Editor({
  content,
  extensions = [],
  onUpdate,
  editorProps,
  children,
  ...props
}: EditorProps) {
  return (
    <EditorProvider
      content={content}
      extensions={[...Preset, ...(extensions ?? [])]}
      onUpdate={onUpdate}
      editorProps={editorProps}
      editorContainerProps={props}
    >
      {children}
    </EditorProvider>
  )
}
