import { EditorProvider } from "@tiptap/react"
import type { EditorProviderProps } from "@tiptap/react"
import { forwardRef } from "react"
import type { FC, ReactNode } from "react"
import { Provider } from "jotai"
import { novelStore } from "../utils/store"

export interface EditorRootProps {
  readonly children: ReactNode
}

export const EditorRoot: FC<EditorRootProps> = ({ children }) => {
  return (
    <Provider store={novelStore as any}>
      {children as any}
    </Provider>
  )
}

export type EditorContentProps = EditorProviderProps & {
  readonly children?: ReactNode
  readonly className?: string
  readonly initialContent?: any
}

export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  ({ className, children, initialContent, content, ...rest }, ref) => {
    const effectiveContent = content ?? initialContent
    return (
      <div ref={ref} className={className}>
        <EditorProvider {...rest} content={effectiveContent}>
          {children}
        </EditorProvider>
      </div>
    )
  }
)

EditorContent.displayName = "EditorContent"
