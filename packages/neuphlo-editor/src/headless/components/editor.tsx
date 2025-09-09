import { EditorProvider } from "@tiptap/react"
import type { EditorProviderProps, JSONContent } from "@tiptap/react"
import { forwardRef } from "react"
import type { FC, ReactNode } from "react"

export interface EditorRootProps {
  readonly children: ReactNode
}

export const EditorRoot: FC<EditorRootProps> = ({ children }) => children as any

export type EditorContentProps = EditorProviderProps & {
  readonly children?: ReactNode
  readonly className?: string
  readonly initialContent?: JSONContent
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
