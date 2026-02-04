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
  type?: "node" | "article" // For reference mentions
  nodeId?: string // For node references (user-facing ID like "TSK-1")
  slug?: string // For article references (URL slug)
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

  /**
   * Custom name for the extension (to avoid duplicates)
   */
  name?: string
}

/**
 * Create the mention extension with custom suggestion rendering
 */
export const createMentionExtension = (options?: MentionOptions) => {
  const extensionName = options?.name ?? "mention"

  return Mention.extend({
    name: extensionName,
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
        type: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-ref-type"),
          renderHTML: (attributes) => {
            if (!attributes.type) {
              return {}
            }
            return {
              "data-ref-type": attributes.type,
            }
          },
        },
        nodeId: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-node-id"),
          renderHTML: (attributes) => {
            if (!attributes.nodeId) {
              return {}
            }
            return {
              "data-node-id": attributes.nodeId,
            }
          },
        },
        slug: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-slug"),
          renderHTML: (attributes) => {
            if (!attributes.slug) {
              return {}
            }
            return {
              "data-slug": attributes.slug,
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
        console.log("Inserting reference:", { extensionName, item })
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: extensionName,
              attrs: {
                id: item.id,
                label: item.label,
                avatar: item.avatar,
                type: item.type,
                nodeId: item.nodeId,
                slug: item.slug,
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

    const gap = 8
    const maxDropdownHeight = 300 // Match the maxHeight from MentionCommand
    const spaceBelow = window.innerHeight - clientRect.bottom
    const spaceAbove = clientRect.top

    // Position above if not enough space below, otherwise position below
    const shouldPositionAbove = spaceBelow < maxDropdownHeight && spaceAbove > spaceBelow

    const left = Math.round(clientRect.left)

    if (shouldPositionAbove) {
      const bottom = Math.round(window.innerHeight - clientRect.top + gap)
      container.style.bottom = `${bottom}px`
      container.style.top = 'auto'
    } else {
      const top = Math.round(clientRect.bottom + gap)
      container.style.top = `${top}px`
      container.style.bottom = 'auto'
    }

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
        event.preventDefault()
        event.stopPropagation()
        destroy()
        return true
      }

      // Handle arrow keys and enter
      if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        event.preventDefault()
        event.stopPropagation()
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
