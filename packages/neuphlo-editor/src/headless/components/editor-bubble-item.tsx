import { forwardRef, isValidElement, cloneElement } from "react"
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react"
import { useCurrentEditor } from "@tiptap/react"
import type { Editor as TiptapEditor } from "@tiptap/react"

interface EditorBubbleItemProps {
  readonly children: ReactNode
  readonly asChild?: boolean
  readonly onSelect?: (editor: TiptapEditor) => void
}

export const EditorBubbleItem = forwardRef<
  HTMLDivElement,
  EditorBubbleItemProps & Omit<ComponentPropsWithoutRef<"div">, "onSelect">
>(({ children, asChild, onSelect, ...rest }, ref) => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onSelect?.(editor)
  }

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<any>
    const childOnClick = (child.props as any)?.onClick as
      | ((e: any) => void)
      | undefined
    const mergedOnClick = (e: any) => {
      childOnClick?.(e)
      if (!e?.defaultPrevented) onSelect?.(editor)
    }

    return cloneElement(child, {
      ...rest,
      ref: (child as any).ref ?? ref,
      onClick: mergedOnClick,
    })
  }

  return (
    <div ref={ref} {...rest} onClick={handleClick}>
      {children}
    </div>
  )
})

EditorBubbleItem.displayName = "EditorBubbleItem"

export default EditorBubbleItem
