import Suggestion from "@tiptap/suggestion"
import { Extension } from "@tiptap/core"
import type { ReactNode } from "react"
import { queryAtom, rangeAtom, slashMenuOpenAtom, slashMenuRectAtom } from "../utils/atoms"
import { novelStore } from "../utils/store"

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
    const base: any = this.options.suggestion ?? {}
    return [
      Suggestion({
        editor: this.editor,
        char: base.char ?? "/",
        startOfLine: base.startOfLine ?? true,
        items: base.items ?? (() => ["/"] as any),
        command: (ctx: any) => {
          if (typeof ctx?.props?.command === "function") {
            ctx.props.command({ editor: ctx.editor, range: ctx.range })
          }
        },
        ...base,
        render: () => {
          return {
            onStart: (props: any) => {
              const { selection } = props.editor.state
              const parentNode = selection.$from.node(selection.$from.depth)
              const blockType = parentNode.type.name

              if (blockType === "codeBlock") return false

              const { $from } = selection
              const marks = $from.marks()
              if (marks.some((mark: any) => mark.type.name === "code" || mark.type.name === "link")) {
                return false
              }

              novelStore.set(queryAtom, props.query ?? "")
              novelStore.set(rangeAtom, props.range ?? null)
              novelStore.set(slashMenuOpenAtom, true)

              const rect = typeof props.clientRect === "function" ? props.clientRect() : null
              novelStore.set(slashMenuRectAtom, rect)
            },
            onUpdate: (props: any) => {
              novelStore.set(queryAtom, props.query ?? "")
              novelStore.set(rangeAtom, props.range ?? null)

              const rect = typeof props.clientRect === "function" ? props.clientRect() : null
              novelStore.set(slashMenuRectAtom, rect)
            },
            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
              if (event.key === "Escape") {
                novelStore.set(slashMenuOpenAtom, false)
                return true
              }

              if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
                const slashCommand = document.querySelector("#slash-command")
                if (slashCommand) {
                  slashCommand.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: event.key,
                      cancelable: true,
                      bubbles: true,
                    })
                  )
                  return true
                }
              }

              return false
            },
            onExit: () => {
              novelStore.set(slashMenuOpenAtom, false)
              novelStore.set(queryAtom, "")
              novelStore.set(rangeAtom, null)
              novelStore.set(slashMenuRectAtom, null)
            },
          }
        },
      }),
    ]
  },
})

export const renderItems = () => ({
  onStart: () => {},
  onUpdate: () => {},
  onKeyDown: () => false,
  onExit: () => {},
})

export interface SuggestionItem {
  title: string
  description: string
  icon: ReactNode
  searchTerms?: string[]
  command?: (props: {
    editor: any
    range: { from: number; to: number }
  }) => void
}

export const createSuggestionItems = (items: SuggestionItem[]) => items

export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const slashCommand = document.querySelector("#slash-command")
    if (slashCommand) return true
  }
}
