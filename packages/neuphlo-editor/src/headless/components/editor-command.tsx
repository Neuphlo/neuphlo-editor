import { useAtomValue } from "jotai"
import { forwardRef, useRef, useEffect, useLayoutEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { queryAtom, slashMenuOpenAtom, slashMenuRectAtom } from "../utils/atoms"
import { novelStore } from "../utils/store"

// EditorCommandOut is no longer needed — kept as a no-op for backward compatibility
export const EditorCommandOut = () => null

export const EditorCommand = forwardRef<HTMLDivElement, any>(
  ({ children, className, ...rest }, ref) => {
    const isOpen = useAtomValue(slashMenuOpenAtom, { store: novelStore })
    const rect = useAtomValue(slashMenuRectAtom, { store: novelStore })
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const contentRef = useRef<HTMLDivElement | null>(null)

    // Reset active index when query changes
    const query = useAtomValue(queryAtom, { store: novelStore })
    useEffect(() => {
      setActiveIndex(0)
    }, [query])

    // Create portal container once
    if (typeof document !== "undefined" && !containerRef.current) {
      const el = document.createElement("div")
      el.style.position = "fixed"
      el.style.zIndex = "9999"
      el.style.minWidth = "240px"
      el.style.display = "none"
      containerRef.current = el
    }

    // Manage DOM attachment
    useEffect(() => {
      const el = containerRef.current
      if (!el) return
      document.body.appendChild(el)
      return () => {
        el.remove()
      }
    }, [])

    // Show/hide and position
    useLayoutEffect(() => {
      const container = containerRef.current
      if (!container) return

      if (!isOpen || !rect) {
        container.style.display = "none"
        return
      }

      container.style.display = ""

      const menuHeight = container.offsetHeight || 360
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top

      let top: number
      if (spaceBelow < menuHeight + 16 && spaceAbove > spaceBelow) {
        top = Math.round(rect.top - menuHeight - 8)
        if (top < 8) top = 8
      } else {
        top = Math.round(rect.bottom + 8)
      }

      let left = Math.round(rect.left)
      const menuWidth = container.offsetWidth || 280
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8
      }
      if (left < 8) left = 8

      container.style.top = `${top}px`
      container.style.left = `${left}px`
    }, [isOpen, rect])

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (!isOpen || !contentRef.current) return

        const items = contentRef.current.querySelectorAll("[role='option']")
        if (items.length === 0) return

        if (e.key === "ArrowDown") {
          e.preventDefault()
          setActiveIndex((prev) => {
            const next = Math.min(prev + 1, items.length - 1)
            items[next]?.scrollIntoView({ block: "nearest" })
            return next
          })
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setActiveIndex((prev) => {
            const next = Math.max(prev - 1, 0)
            items[next]?.scrollIntoView({ block: "nearest" })
            return next
          })
        } else if (e.key === "Enter") {
          e.preventDefault()
          const activeItem = items[activeIndex] as HTMLElement | undefined
          activeItem?.click()
        }
      },
      [isOpen, activeIndex]
    )

    useEffect(() => {
      if (!isOpen) return
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, handleKeyDown])

    // Apply active styling
    useEffect(() => {
      if (!contentRef.current) return
      const items = contentRef.current.querySelectorAll("[role='option']")
      items.forEach((item, i) => {
        if (i === activeIndex) {
          item.setAttribute("aria-selected", "true")
        } else {
          item.removeAttribute("aria-selected")
        }
      })
    })

    if (!isOpen || !containerRef.current) return null

    return createPortal(
      <div
        ref={(el) => {
          contentRef.current = el
          if (typeof ref === "function") ref(el)
          else if (ref) ref.current = el
        }}
        id="slash-command"
        className={className}
        {...rest}
      >
        {children}
      </div>,
      containerRef.current
    )
  }
)

// Simple list wrapper
export const EditorCommandList = forwardRef<HTMLDivElement, any>(
  ({ children, ...rest }, ref) => {
    return (
      <div ref={ref} role="listbox" {...rest}>
        {children}
      </div>
    )
  }
)

EditorCommand.displayName = "EditorCommand"
EditorCommandList.displayName = "EditorCommandList"
