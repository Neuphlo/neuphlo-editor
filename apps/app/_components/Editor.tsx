"use client"

// Next
import dynamic from "next/dynamic"

// Componments
import { Card } from "@/components/ui/card"
import { EditorProps } from "neuphlo-editor/react"

const NeuphloEditor = dynamic(
  () =>
    import("neuphlo-editor/react").then((mod) => ({
      default: mod.Editor,
    })),
  {
    loading: () => <Card className="p-6">Loading...</Card>,
  }
)

export default function Editor({ content }: EditorProps) {
  return (
    <Card className="p-6">
      <NeuphloEditor content={content} />
    </Card>
  )
}
