import { ReactRenderer } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import { Extension } from "@tiptap/core"
import type { RefObject, ReactNode } from "react"
import { EditorCommandOut } from "../components/editor-command"

export const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: (ctx: any) => {
          ctx.props.command({ editor: ctx.editor, range: ctx.range })
        },
      } as any,
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export const renderItems = (elementRef?: RefObject<Element> | null) => {
  let component: ReactRenderer | null = null
  let container: HTMLElement | null = null

  const destroy = () => {
    component?.destroy()
    component = null
    if (container) {
      container.remove()
      container = null
    }
  }

  const updatePosition = (clientRect?: DOMRect | null) => {
    if (!container || !clientRect) return
    const top = Math.round(clientRect.bottom + 8)
    const left = Math.round(clientRect.left)
    container.style.top = `${top}px`
    container.style.left = `${left}px`
  }

  return {
    onStart: (props: { editor: any; clientRect: DOMRect | null }) => {
      const { selection } = props.editor.state
      const parentNode = selection.$from.node(selection.$from.depth)
      const blockType = parentNode.type.name
      if (blockType === "codeBlock") return false

      component = new ReactRenderer(EditorCommandOut, {
        props,
        editor: props.editor,
      })

      container = document.createElement("div")
      container.style.position = "fixed"
      container.style.zIndex = "9999"
      container.style.minWidth = "240px"
      ;(elementRef?.current ?? document.body).appendChild(container)
      container.appendChild(component.element)

      if (props.clientRect) updatePosition(props.clientRect)
    },
    onUpdate: (props: {
      editor: any
      clientRect: (() => DOMRect | null) | null
    }) => {
      component?.updateProps(props as any)
      const rect = typeof props.clientRect === "function" ? props.clientRect() : null
      if (rect) updatePosition(rect)
    },
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "Escape") {
        destroy()
        return true
      }
      return false
    },
    onExit: () => {
      destroy()
    },
  }
}

export interface SuggestionItem {
  title: string
  description: string
  icon: ReactNode
  searchTerms?: string[]
  command?: (props: { editor: any; range: { from: number; to: number } }) => void
}

export const createSuggestionItems = (items: SuggestionItem[]) => items

export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const slashCommand = document.querySelector("#slash-command")
    if (slashCommand) return true
  }
}

