import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { MentionItem } from "./mention"

interface MentionListProps {
  items: MentionItem[]
  command: (item: MentionItem) => void
  query: string
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
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
      className="nph-mention-list"
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        maxHeight: "320px",
        overflowY: "auto",
        padding: "4px",
      }}
    >
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectItem(index)}
            className="nph-mention-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px",
              border: "none",
              borderRadius: "6px",
              background: index === selectedIndex ? "#f1f5f9" : "transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {/* Avatar */}
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.label}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "600",
                  color: "#64748b",
                }}
              >
                {item.label.slice(0, 2).toUpperCase()}
              </div>
            )}

            {/* Name and optional email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </div>
              {item.email && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.email}
                </div>
              )}
            </div>
          </button>
        ))
      ) : (
        <div
          style={{
            padding: "12px",
            fontSize: "14px",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          No results found
        </div>
      )}
    </div>
  )
})

MentionList.displayName = "MentionList"
