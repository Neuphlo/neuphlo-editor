import * as React from 'react'
import { EditorProvider } from '@tiptap/react'
import type { Extension, Content } from '@tiptap/core'
import { NeuphloPreset } from '../preset'

export type EditorProps = {
  content?: Content
  extensions?: Extension[]
  onUpdate?: Parameters<typeof EditorProvider>[0]['onUpdate']
  children?: React.ReactNode
}

export function Editor({
  content,
  extensions = [],
  onUpdate,
  children,
}: EditorProps) {
  return (
    <EditorProvider
      content={content}
      extensions={[...NeuphloPreset, ...(extensions ?? [])]}
      onUpdate={onUpdate}
    >
      {children}
    </EditorProvider>
  )
}
