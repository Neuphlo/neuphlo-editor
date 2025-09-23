"use client"

// Next
import dynamic from "next/dynamic"
import { useMemo, useRef } from "react"
import { Trash2 } from "lucide-react"
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
  const STORAGE_KEY = "neuphlo-editor-content"

  const editorRef = useRef<any | null>(null)
  const isClearingRef = useRef(false)

  const initialContent = useMemo(() => {
    if (typeof window === "undefined") return content
    try {
      return localStorage.getItem(STORAGE_KEY) ?? content
    } catch {
      return content
    }
  }, [content])

  const handleUpdate = ({ editor }: any) => {
    if (isClearingRef.current) return
    try {
      const html = editor.getHTML()
      localStorage.setItem(STORAGE_KEY, html)
    } catch {
      // ignore write errors
    }
  }

  const handleCreate = ({ editor }: any) => {
    editorRef.current = editor
  }

  const handleClear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    isClearingRef.current = true
    editorRef.current?.commands.clearContent(false)
    setTimeout(() => (isClearingRef.current = false), 0)
  }
  return (
    <Card className="relative p-6">
      <button
        type="button"
        onClick={handleClear}
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Clear all content"
      >
        <Trash2 className="size-3" aria-hidden="true" />
        Clear
      </button>
      <NeuphloEditor
        content={initialContent}
        onUpdate={handleUpdate}
        onCreate={handleCreate}
      />
    </Card>
  )
}
