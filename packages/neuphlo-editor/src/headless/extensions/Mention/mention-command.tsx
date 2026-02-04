import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { MentionItem } from "./mention"

interface MentionCommandProps {
  items: MentionItem[]
  command: (item: MentionItem) => void
  query: string
}

// Simple Avatar component with inline styles
function Avatar({ src, fallback }: { src?: string; fallback: string }) {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      height: "24px",
      width: "24px",
      flexShrink: 0,
      overflow: "hidden",
      borderRadius: "9999px",
    }}>
      {src ? (
        <img
          style={{
            aspectRatio: "1",
            height: "100%",
            width: "100%",
          }}
          src={src}
          alt={fallback}
        />
      ) : (
        <div style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "9999px",
          backgroundColor: "var(--muted)",
          color: "var(--muted-foreground)",
          fontSize: "10px",
          fontWeight: 600,
        }}>
          {fallback}
        </div>
      )}
    </div>
  )
}

// Icon component for reference types
function ReferenceIcon({ type }: { type: "node" | "article" }) {
  if (type === "node") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M12 3l8 4.5v9l-8 4.5l-8-4.5v-9l8-4.5"></path>
        <path d="M12 12l8-4.5"></path>
        <path d="M12 12v9"></path>
        <path d="M12 12l-8-4.5"></path>
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
      <path d="M9 9l1 0"></path>
      <path d="M9 13l6 0"></path>
      <path d="M9 17l6 0"></path>
    </svg>
  )
}

export const MentionCommand = forwardRef<any, MentionCommandProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler()
        return true
      }

      if (event.key === "ArrowDown") {
        downHandler()
        return true
      }

      if (event.key === "Enter") {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div
      id="mention-list"
      style={{
        backgroundColor: "var(--popover)",
        color: "var(--foreground)",
        maxHeight: "300px",
        minWidth: "280px",
        overflow: "hidden",
        overflowY: "auto",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        padding: "4px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      }}
    >
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            style={{
              position: "relative",
              display: "flex",
              width: "100%",
              cursor: "default",
              userSelect: "none",
              alignItems: "center",
              gap: "8px",
              borderRadius: "4px",
              padding: "10px 8px",
              fontSize: "14px",
              outline: "none",
              backgroundColor: index === selectedIndex ? "var(--accent)" : "transparent",
              color: index === selectedIndex ? "var(--accent-foreground)" : "inherit",
              border: "none",
              textAlign: "left",
            }}
          >
            {item.type ? (
              <ReferenceIcon type={item.type} />
            ) : (
              <Avatar
                src={item.avatar}
                fallback={item.label.slice(0, 2).toUpperCase()}
              />
            )}
            <span style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {item.label}
            </span>
          </button>
        ))
      ) : (
        <div style={{
          padding: "24px 0",
          textAlign: "center",
          fontSize: "14px",
          color: "var(--muted-foreground)",
        }}>
          No results found
        </div>
      )}
    </div>
  )
})

MentionCommand.displayName = "MentionCommand"
