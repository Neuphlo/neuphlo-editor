import { EditorProvider } from "@tiptap/react"
import type { EditorProviderProps } from "@tiptap/react"
import { forwardRef } from "react"
import type { FC, ReactNode } from "react"
import { Provider } from "jotai"
import tunnel from "tunnel-rat"
import { novelStore } from "../utils/store"
import { EditorCommandTunnelContext } from "./editor-command"

export interface EditorRootProps {
  readonly children: ReactNode
}

export const EditorRoot: FC<EditorRootProps> = ({ children }) => {
  const tunnelInstance = (tunnel as any)()
  return (
    <Provider store={novelStore as any}>
      <EditorCommandTunnelContext.Provider value={tunnelInstance}>
        {children as any}
      </EditorCommandTunnelContext.Provider>
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
