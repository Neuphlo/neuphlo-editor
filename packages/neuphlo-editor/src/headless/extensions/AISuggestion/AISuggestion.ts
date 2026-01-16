/**
 * TipTap AI Suggestion Extension
 *
 * This extension provides inline AI-powered text completions that appear
 * as ghost text at the cursor position.
 *
 * Usage:
 * ```ts
 * import { AISuggestion } from 'neuphlo-editor'
 *
 * const editor = new Editor({
 *   extensions: [
 *     AISuggestion.configure({
 *       onFetchSuggestion: async (context) => {
 *         // Call your AI API here
 *         const response = await fetch('/api/complete', {
 *           method: 'POST',
 *           body: JSON.stringify({ text: context }),
 *         })
 *         const data = await response.json()
 *         return data.completion
 *       },
 *       debounceMs: 2000,
 *     }),
 *   ],
 * })
 * ```
 */

import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export interface AISuggestionOptions {
  /**
   * Function to fetch AI suggestion based on text context
   * Return null or empty string to show no suggestion
   */
  onFetchSuggestion: (context: string) => Promise<string | null>

  /**
   * Delay in ms after typing stops before fetching suggestion
   * @default 2000
   */
  debounceMs?: number

  /**
   * Minimum characters required before fetching suggestions
   * @default 10
   */
  minChars?: number

  /**
   * CSS class for the ghost text element
   * @default 'ai-suggestion'
   */
  suggestionClass?: string

  /**
   * Whether the extension is enabled
   * @default true
   */
  enabled?: boolean
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiSuggestion: {
      /**
       * Accept the current AI suggestion
       */
      acceptAISuggestion: () => ReturnType
      /**
       * Dismiss the current AI suggestion
       */
      dismissAISuggestion: () => ReturnType
      /**
       * Manually trigger a suggestion fetch
       */
      triggerAISuggestion: () => ReturnType
      /**
       * Set a suggestion programmatically
       */
      setAISuggestion: (text: string) => ReturnType
    }
  }
}

export const AISuggestionPluginKey = new PluginKey("aiSuggestion")

export const AISuggestion = Extension.create<AISuggestionOptions>({
  name: "aiSuggestion",

  addOptions() {
    return {
      onFetchSuggestion: async () => null,
      debounceMs: 2000,
      minChars: 10,
      suggestionClass: "ai-suggestion",
      enabled: true,
    }
  },

  addCommands() {
    return {
      acceptAISuggestion:
        () =>
        ({ editor, tr, dispatch }) => {
          const pluginState = AISuggestionPluginKey.getState(editor.state)
          if (!pluginState?.suggestion) return false

          if (dispatch) {
            // Insert the suggestion text at cursor
            const { from } = editor.state.selection
            tr.insertText(pluginState.suggestion, from)

            // Clear the suggestion
            tr.setMeta(AISuggestionPluginKey, { suggestion: null })
          }

          return true
        },

      dismissAISuggestion:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(AISuggestionPluginKey, { suggestion: null })
          }
          return true
        },

      triggerAISuggestion:
        () =>
        ({ editor }) => {
          const pluginState = AISuggestionPluginKey.getState(editor.state)
          if (pluginState?.fetchSuggestion) {
            pluginState.fetchSuggestion()
          }
          return true
        },

      setAISuggestion:
        (text: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(AISuggestionPluginKey, { suggestion: text })
          }
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const pluginState = AISuggestionPluginKey.getState(editor.state)
        if (pluginState?.suggestion) {
          return editor.commands.acceptAISuggestion()
        }
        return false // Let other Tab handlers run
      },
      Escape: ({ editor }) => {
        const pluginState = AISuggestionPluginKey.getState(editor.state)
        if (pluginState?.suggestion) {
          return editor.commands.dismissAISuggestion()
        }
        return false
      },
    }
  },

  addProseMirrorPlugins() {
    const { options } = this

    return [
      new Plugin({
        key: AISuggestionPluginKey,

        state: {
          init() {
            return {
              suggestion: null as string | null,
              isLoading: false,
              fetchSuggestion: null as (() => void) | null,
            }
          },

          apply(tr, value) {
            const meta = tr.getMeta(AISuggestionPluginKey)
            if (meta !== undefined) {
              return { ...value, ...meta }
            }

            // Clear suggestion if document changed (user is typing)
            if (tr.docChanged && value.suggestion) {
              return { ...value, suggestion: null }
            }

            return value
          },
        },

        view(editorView) {
          let debounceTimer: ReturnType<typeof setTimeout> | null = null
          let lastContent = ""

          const fetchSuggestion = async () => {
            if (!options.enabled) return

            const { state } = editorView
            const { from } = state.selection

            // Get text before cursor
            const textBefore = state.doc.textBetween(
              Math.max(0, from - 500),
              from,
              "\n"
            )

            if (textBefore.trim().length < (options.minChars ?? 10)) {
              return
            }

            // Set loading state
            editorView.dispatch(
              state.tr.setMeta(AISuggestionPluginKey, { isLoading: true })
            )

            try {
              const suggestion = await options.onFetchSuggestion(textBefore)

              if (suggestion && suggestion.trim()) {
                // Add leading space if needed
                let finalSuggestion = suggestion.trim()
                if (
                  !finalSuggestion.startsWith(" ") &&
                  !textBefore.endsWith(" ")
                ) {
                  finalSuggestion = " " + finalSuggestion
                }

                editorView.dispatch(
                  editorView.state.tr.setMeta(AISuggestionPluginKey, {
                    suggestion: finalSuggestion,
                    isLoading: false,
                  })
                )
              } else {
                editorView.dispatch(
                  editorView.state.tr.setMeta(AISuggestionPluginKey, {
                    suggestion: null,
                    isLoading: false,
                  })
                )
              }
            } catch (error) {
              console.error("[AISuggestion] Error fetching suggestion:", error)
              editorView.dispatch(
                editorView.state.tr.setMeta(AISuggestionPluginKey, {
                  suggestion: null,
                  isLoading: false,
                })
              )
            }
          }

          // Store fetchSuggestion reference in plugin state
          editorView.dispatch(
            editorView.state.tr.setMeta(AISuggestionPluginKey, {
              fetchSuggestion,
            })
          )

          return {
            update(view, prevState) {
              if (!options.enabled) return

              const currentContent = view.state.doc.textContent

              // Only react to content changes
              if (currentContent !== lastContent) {
                lastContent = currentContent

                // Clear existing timer
                if (debounceTimer) {
                  clearTimeout(debounceTimer)
                }

                // Set new timer
                debounceTimer = setTimeout(() => {
                  fetchSuggestion()
                }, options.debounceMs ?? 2000)
              }
            },

            destroy() {
              if (debounceTimer) {
                clearTimeout(debounceTimer)
              }
            },
          }
        },

        props: {
          decorations(state) {
            const pluginState = AISuggestionPluginKey.getState(state)
            if (!pluginState) return DecorationSet.empty

            const { suggestion, isLoading } = pluginState
            const { from } = state.selection

            const decorations: Decoration[] = []

            if (isLoading) {
              // Show loading indicator
              const widget = document.createElement("span")
              widget.className = `${options.suggestionClass}-loading`
              widget.innerHTML = `<span class="ai-suggestion-spinner"></span>`
              widget.style.cssText = "opacity: 0.4; pointer-events: none;"

              decorations.push(Decoration.widget(from, widget, { side: 1 }))
            } else if (suggestion) {
              // Show ghost text
              const widget = document.createElement("span")
              widget.className = options.suggestionClass ?? "ai-suggestion"
              widget.textContent = suggestion
              widget.style.cssText = `
                opacity: 0.4;
                pointer-events: none;
                color: var(--muted-foreground, #888);
              `

              // Add Tab hint
              const hint = document.createElement("kbd")
              hint.textContent = "Tab"
              hint.style.cssText = `
                margin-left: 8px;
                font-size: 10px;
                opacity: 0.3;
                background: var(--muted, #f1f1f1);
                padding: 1px 4px;
                border-radius: 3px;
                font-family: system-ui, sans-serif;
              `
              widget.appendChild(hint)

              decorations.push(Decoration.widget(from, widget, { side: 1 }))
            }

            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})

export default AISuggestion
