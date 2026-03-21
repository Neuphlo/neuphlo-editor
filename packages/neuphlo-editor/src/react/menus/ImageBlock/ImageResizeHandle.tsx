import { useCallback, useRef, useState } from "react"
import type { ReactNode } from "react"

export type ImageResizeHandleProps = {
  children: ReactNode
  onResize: (widthPercent: number) => void
  currentWidth?: string
}

export function ImageResizeHandle({
  children,
  onResize,
  currentWidth,
}: ImageResizeHandleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, side: "left" | "right") => {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)

      const startX = e.clientX
      const containerEl = containerRef.current
      if (!containerEl) return

      const editorEl = containerEl.closest(".nph-editor") || containerEl.parentElement
      if (!editorEl) return

      const editorWidth = editorEl.getBoundingClientRect().width
      const startWidth = containerEl.getBoundingClientRect().width
      const startPercent = (startWidth / editorWidth) * 100

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX
        const direction = side === "right" ? 1 : -1
        const deltaPercent = (deltaX * direction / editorWidth) * 100 * 2 // *2 because resizing from center
        const newPercent = Math.max(10, Math.min(100, startPercent + deltaPercent))
        onResize(Math.round(newPercent))
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [onResize]
  )

  return (
    <div
      ref={containerRef}
      className={`nph-resize-wrapper${isResizing ? " nph-resize-wrapper--active" : ""}`}
    >
      {children}
      <div
        className="nph-resize-handle nph-resize-handle--left"
        onMouseDown={(e) => handleMouseDown(e, "left")}
      />
      <div
        className="nph-resize-handle nph-resize-handle--right"
        onMouseDown={(e) => handleMouseDown(e, "right")}
      />
    </div>
  )
}

export default ImageResizeHandle
