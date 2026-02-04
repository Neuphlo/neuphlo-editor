import { ReactRenderer, ReactNodeViewRenderer } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import Mention from "@tiptap/extension-mention"
import type { SuggestionOptions } from "@tiptap/suggestion"
import type { RefObject } from "react"
import { MentionCommand } from "./mention-command"
import { MentionNodeView } from "./mention-node-view"

export interface MentionItem {
  id: string
  label: string
  avatar?: string
  email?: string
}

export interface MentionOptions {
  /**
   * Function to fetch/filter mentionable items based on query
   */
  items?: (query: string) => MentionItem[] | Promise<MentionItem[]>

  /**
   * Custom render function for mention nodes
   */
  renderLabel?: (props: { node: any; options: any }) => string

  /**
   * Character that triggers the mention autocomplete (default: @)
   */
  char?: string
}

/**
 * Create the mention extension with custom suggestion rendering
 */
export const createMentionExtension = (options?: MentionOptions) => {
  return Mention.extend({
    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-id"),
          renderHTML: (attributes) => {
            if (!attributes.id) {
              return {}
            }
            return {
              "data-id": attributes.id,
            }
          },
        },
        label: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-label"),
          renderHTML: (attributes) => {
            if (!attributes.label) {
              return {}
            }
            return {
              "data-label": attributes.label,
            }
          },
        },
        avatar: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-avatar"),
          renderHTML: (attributes) => {
            if (!attributes.avatar) {
              return {}
            }
            return {
              "data-avatar": attributes.avatar,
            }
          },
        },
      }
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView)
    },
  }).configure({
    HTMLAttributes: {
      class: "mention",
    },
    suggestion: {
      char: options?.char ?? "@",
      items: async ({ query }: { query: string }) => {
        if (!options?.items) return []
        const items = await options.items(query)
        return items
      },
      command: ({ editor, range, props: item }: any) => {
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: "mention",
              attrs: {
                id: item.id,
                label: item.label,
                avatar: item.avatar,
              },
            },
          ])
          .run()
      },
      render: renderMentionSuggestion,
    },
    renderLabel: options?.renderLabel ?? ((props) => {
      return `@${props.node.attrs.label ?? props.node.attrs.id}`
    }),
  })
}

/**
 * Render function for mention suggestions (autocomplete dropdown)
 */
export const renderMentionSuggestion = () => {
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
    onStart: (props: any) => {
      component = new ReactRenderer(MentionCommand, {
        props: {
          items: props.items ?? [],
          command: props.command ?? (() => {}),
          query: props.query ?? "",
        },
        editor: props.editor,
      })

      container = document.createElement("div")
      container.style.position = "fixed"
      container.style.zIndex = "9999"
      document.body.appendChild(container)
      container.appendChild(component.element)

      const rect =
        typeof props.clientRect === "function" ? props.clientRect() : null
      if (rect) updatePosition(rect)
    },
    onUpdate: (props: any) => {
      component?.updateProps({
        items: props.items ?? [],
        command: props.command ?? (() => {}),
        query: props.query ?? "",
      })
      const rect =
        typeof props.clientRect === "function" ? props.clientRect() : null
      if (rect) updatePosition(rect)
    },
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (!component) return false

      if (event.key === "Escape") {
        destroy()
        return true
      }

      // Handle arrow keys and enter
      if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        // Let the MentionList component handle keyboard navigation
        return (component.ref as any)?.onKeyDown?.({ event }) ?? false
      }

      return false
    },
    onExit: () => {
      destroy()
    },
  }
}

export default createMentionExtension
