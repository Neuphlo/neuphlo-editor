import { NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"

export const MentionNodeView = (props: NodeViewProps) => {
  const { node } = props
  const { id, label, avatar } = node.attrs

  return (
    <NodeViewWrapper
      as="span"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: "var(--accent)",
        color: "var(--accent-foreground)",
        padding: "2px 8px 2px 2px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        verticalAlign: "middle",
      }}
    >
      {avatar && (
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
      {!avatar && (
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
