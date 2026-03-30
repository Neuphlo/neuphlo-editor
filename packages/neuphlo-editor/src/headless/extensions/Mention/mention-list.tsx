import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { MentionItem } from "./mention"

// Gradient map for agent avatars (avatar field stores a gradient key like "violet")
const GRADIENT_MAP: Record<string, string> = {
  red: "linear-gradient(135deg, #ef4444, #fb7185)",
  coral: "linear-gradient(135deg, #f87171, #fb923c)",
  orange: "linear-gradient(135deg, #f97316, #fbbf24)",
  amber: "linear-gradient(135deg, #f59e0b, #facc15)",
  lime: "linear-gradient(135deg, #84cc16, #4ade80)",
  green: "linear-gradient(135deg, #10b981, #2dd4bf)",
  teal: "linear-gradient(135deg, #14b8a6, #22d3ee)",
  cyan: "linear-gradient(135deg, #06b6d4, #60a5fa)",
  blue: "linear-gradient(135deg, #3b82f6, #818cf8)",
  indigo: "linear-gradient(135deg, #6366f1, #a78bfa)",
  violet: "linear-gradient(135deg, #8b5cf6, #a855f7)",
  purple: "linear-gradient(135deg, #a855f7, #d946ef)",
  fuchsia: "linear-gradient(135deg, #d946ef, #f472b6)",
  pink: "linear-gradient(135deg, #ec4899, #fb7185)",
  slate: "linear-gradient(135deg, #64748b, #71717a)",
  stone: "linear-gradient(135deg, #78716c, #a3a3a3)",
}

function isAgent(item: { email?: string }): boolean {
  return !!item.email?.endsWith("@ai.neuphlo.local")
}

function isGradientKey(avatar?: string): boolean {
  return !!avatar && avatar in GRADIENT_MAP
}

function getAgentGradient(item: { avatar?: string }): string {
  return GRADIENT_MAP[item.avatar || "violet"] || GRADIENT_MAP.violet
}

function getInitials(name: string): string {
  if (!name) return "AG"
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

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
        (() => {
          const agents = props.items.filter(i => isAgent(i))
          const members = props.items.filter(i => !isAgent(i))
          const sections: Array<{ label: string; items: typeof props.items; startIndex: number }> = []
          if (agents.length) sections.push({ label: "Agents", items: agents, startIndex: 0 })
          if (members.length) sections.push({ label: "Members", items: members, startIndex: agents.length })

          return sections.map((section) => (
            <div key={section.label}>
              <div style={{ padding: "6px 8px 4px", fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {section.label}
              </div>
              {section.items.map((item, i) => {
                const index = section.startIndex + i
                return (
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
                    {(isGradientKey(item.avatar) || isAgent(item)) ? (
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: getAgentGradient(item),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "600",
                          color: "#ffffff",
                        }}
                      >
                        {getInitials(item.label)}
                      </div>
                    ) : item.avatar ? (
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
                      {item.email && !isAgent(item) && (
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
                )
              })}
            </div>
          ))
        })()
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
