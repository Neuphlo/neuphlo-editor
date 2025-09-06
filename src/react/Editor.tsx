import * as React from "react"
import { EditorProvider } from "@tiptap/react"
import type { EditorProviderProps } from "@tiptap/react"
import { Preset } from "../preset"
import { cn } from "./utils/cn"
import { Selection } from "./menus/Selection"

export type EditorProps = Omit<
  EditorProviderProps,
  "children" | "slotBefore" | "slotAfter" | "editorContainerProps"
> & {
  className?: string
  editorContainerProps?: Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "className" | "children"
  >
  showSelectionMenu?: boolean
  selectionMenu?: React.ReactNode
  children?: React.ReactNode
}

export function Editor({
  className,
  editorContainerProps,
  extensions = [],
  content,
  onUpdate,
  editorProps,
  editable = true,
  showSelectionMenu = true,
  selectionMenu,
  immediatelyRender = false,
  children,
  ...rest
}: EditorProps) {
  const mergedContainerProps = {
    ...editorContainerProps,
    className: cn("nph-editor", className),
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
      immediatelyRender={immediatelyRender}
      {...rest}
    >
      {showSelectionMenu && (selectionMenu ?? <Selection />)}
      {children}
    </EditorProvider>
  )
}
