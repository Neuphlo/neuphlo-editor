import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { MentionItem } from "./mention"

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

function isGradientKey(avatar?: string): boolean {
  return !!avatar && avatar in GRADIENT_MAP
}

function isAgentItem(item: MentionItem): boolean {
  return !!item.email?.endsWith("@ai.neuphlo.local")
}

function getInitials(name: string): string {
  if (!name) return "AG"
  return name.split(/\s+/).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
}

interface MentionCommandProps {
  items: MentionItem[]
  command: (item: MentionItem) => void
  query: string
}

// Simple Avatar component with inline styles
function Avatar({ src, fallback, isAgent }: { src?: string; fallback: string; isAgent?: boolean }) {
  const gradient = src && isGradientKey(src) ? GRADIENT_MAP[src] : isAgent ? GRADIENT_MAP.violet : null

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
      {gradient ? (
        <div style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "9999px",
          background: gradient,
          color: "#ffffff",
          fontSize: "10px",
          fontWeight: 600,
        }}>
          {fallback}
        </div>
      ) : src ? (
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
        (() => {
          const agents = props.items.filter(i => !i.type && isAgentItem(i))
          const others = props.items.filter(i => i.type || !isAgentItem(i))
          const sections: Array<{ label: string | null; items: typeof props.items; startIndex: number }> = []
          if (agents.length) sections.push({ label: "Agents", items: agents, startIndex: 0 })
          if (others.length) sections.push({ label: agents.length ? "Members" : null, items: others, startIndex: agents.length })

          return sections.map((section) => (
            <div key={section.label ?? "default"}>
              {section.label && (
                <div style={{ padding: "6px 8px 2px", fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {section.label}
                </div>
              )}
              {section.items.map((item, i) => {
                const index = section.startIndex + i
                const agent = isAgentItem(item)
                return (
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
                        fallback={getInitials(item.label)}
                        isAgent={agent}
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
                )
              })}
            </div>
          ))
        })()
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
