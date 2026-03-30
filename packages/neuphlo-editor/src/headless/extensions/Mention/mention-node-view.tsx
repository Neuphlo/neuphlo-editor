import { NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"

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

// Icon components
function NodeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 3l8 4.5v9l-8 4.5l-8-4.5v-9l8-4.5"></path>
      <path d="M12 12l8-4.5"></path>
      <path d="M12 12v9"></path>
      <path d="M12 12l-8-4.5"></path>
    </svg>
  )
}

function ArticleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
      <path d="M9 9l1 0"></path>
      <path d="M9 13l6 0"></path>
      <path d="M9 17l6 0"></path>
    </svg>
  )
}

export const MentionNodeView = (props: NodeViewProps) => {
  const { node } = props
  const { id, label, avatar, type } = node.attrs

  // Determine styling based on type
  const isNode = type === "node"
  const isArticle = type === "article"
  const isReference = isNode || isArticle

  const backgroundColor = isArticle
    ? "rgba(249, 115, 22, 0.15)" // Orange for articles
    : isNode
    ? "rgba(107, 114, 128, 0.15)" // Gray for nodes
    : "var(--accent)" // Default for user mentions

  const color = isArticle
    ? "rgb(234, 88, 12)" // Orange text
    : isNode
    ? "rgb(75, 85, 99)" // Gray text
    : "var(--accent-foreground)" // Default

  const border = isArticle
    ? "1px solid rgba(249, 115, 22, 0.3)"
    : isNode
    ? "1px solid rgba(107, 114, 128, 0.3)"
    : "none"

  return (
    <NodeViewWrapper
      as="span"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        backgroundColor,
        color,
        border,
        padding: isReference ? "1px 6px" : "1px 6px 1px 1px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 500,
        verticalAlign: "middle",
      }}
    >
      {/* Show icon for references */}
      {isNode && <NodeIcon />}
      {isArticle && <ArticleIcon />}

      {/* Show avatar for user mentions */}
      {!isReference && avatar && avatar in GRADIENT_MAP && (
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: GRADIENT_MAP[avatar],
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "8px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {(label || id).split(/\s+/).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>
      )}
      {!isReference && avatar && !(avatar in GRADIENT_MAP) && (
        <img
          src={avatar}
          alt={label || id}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            flexShrink: 0,
          }}
        />
      )}
      {!isReference && !avatar && (
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {(label || id).slice(0, 2).toUpperCase()}
        </div>
      )}
      <span>{label || id}</span>
    </NodeViewWrapper>
  )
}
