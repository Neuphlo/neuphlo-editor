"use client"

// Next
import dynamic from "next/dynamic"
import type { EditorProps } from "../../../../../packages/neuphlo-editor/src/react"

// Componments
import { Card } from "@/components/ui/card"

const NeuphloEditor = dynamic(
  () =>
    import("../../../../../packages/neuphlo-editor/src/react").then((mod) => ({
      default: mod.Editor,
    })),
  {
    loading: () => <div></div>,
  }
)

export default function Editor({ content }: EditorProps) {
  return (
    <Card className="p-6">
      <NeuphloEditor content={content} />
    </Card>
  )
}
