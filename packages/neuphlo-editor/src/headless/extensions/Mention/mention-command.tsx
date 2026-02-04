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
            <Avatar
              src={item.avatar}
              fallback={item.label.slice(0, 2).toUpperCase()}
            />
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
          No users found
        </div>
      )}
    </div>
  )
})

MentionCommand.displayName = "MentionCommand"
