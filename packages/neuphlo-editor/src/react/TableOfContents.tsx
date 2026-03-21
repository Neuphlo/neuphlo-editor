import { useCurrentEditor, useEditorState } from "@tiptap/react"
import { useCallback, useEffect, useRef, useState } from "react"

interface TocItem {
  id: string
  level: number
  text: string
  pos: number
}

export type TableOfContentsProps = {
  className?: string
  itemClassName?: string
  activeClassName?: string
}

export function TableOfContents({
  className,
  itemClassName,
  activeClassName,
}: TableOfContentsProps) {
  const { editor } = useCurrentEditor()
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const headings = useEditorState({
    editor,
    selector: (ctx): TocItem[] => {
      if (!ctx.editor) return []
      const items: TocItem[] = []
      ctx.editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          const id = `heading-${pos}`
          items.push({
            id,
            level: node.attrs.level as number,
            text: node.textContent,
            pos,
          })
        }
      })
      return items
    },
  })

  // Set up IntersectionObserver to track which heading is in view
  useEffect(() => {
    if (!editor || !headings || headings.length === 0) return

    // Clean up old observer
    observerRef.current?.disconnect()

    const callback: IntersectionObserverCallback = (entries) => {
      // Find the first visible heading
      const visibleEntries = entries.filter((e) => e.isIntersecting)
      if (visibleEntries.length > 0) {
        const firstVisible = visibleEntries[0]
        const id = firstVisible.target.getAttribute("data-toc-id")
        if (id) setActiveId(id)
      }
    }

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -70% 0px",
      threshold: 0,
    })

    observerRef.current = observer

    // Observe heading DOM elements
    const editorEl = editor.view.dom
    headings.forEach((heading) => {
      // Find heading element by position
      try {
        const domNode = editor.view.nodeDOM(heading.pos)
        if (domNode && domNode instanceof HTMLElement) {
          domNode.setAttribute("data-toc-id", heading.id)
          observer.observe(domNode)
        }
      } catch {
        // Position may be invalid after edits
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [editor, headings])

  const handleClick = useCallback(
    (pos: number) => {
      if (!editor) return
      editor.chain().focus().setTextSelection(pos + 1).run()

      // Scroll into view
      try {
        const domNode = editor.view.nodeDOM(pos)
        if (domNode && domNode instanceof HTMLElement) {
          domNode.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      } catch {
        // Ignore if DOM node not found
      }
    },
    [editor]
  )

  if (!editor || !headings || headings.length === 0) return null

  return (
    <nav className={className ?? "nph-toc"}>
      {headings.map((heading) => {
        const isActive = activeId === heading.id
        const itemClass = [
          itemClassName ?? "nph-toc__item",
          isActive ? (activeClassName ?? "nph-toc__item--active") : "",
        ]
          .filter(Boolean)
          .join(" ")

        return (
          <button
            key={heading.id}
            type="button"
            className={itemClass}
            style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
            onClick={() => handleClick(heading.pos)}
            title={heading.text}
          >
            {heading.text || `Heading ${heading.level}`}
          </button>
        )
      })}
    </nav>
  )
}

export default TableOfContents
