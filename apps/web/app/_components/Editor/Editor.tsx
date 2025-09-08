"use client"

// Next
import dynamic from "next/dynamic"

// Componments
import { Card } from "@/components/ui/card"

const NeuphloEditor = dynamic(
  () =>
    import("../../../../../packages/neuphlo-editor/src/react").then((mod) => ({
      default: mod.Editor,
    })),
  {
    loading: () => <Card className="p-6">Loading...</Card>,
  }
)

export default function Editor({ content }: any) {
  return (
    <Card className="p-6">
      <NeuphloEditor content={content} />
    </Card>
  )
}
