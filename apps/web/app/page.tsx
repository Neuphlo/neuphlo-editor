"use client"

import Content from "@/components/content/example-content"
import { Editor } from "./_components/Editor"

export default function Home() {
  return (
    <main className="min-h-screen max-w-5xl mx-auto p-6 flex flex-col gap-6 mt-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Neuphlo Editor Demo</h1>
        <p className="text-muted-foreground">
          Try typing <code className="px-2 py-1 bg-muted rounded">@</code> to mention someone or{" "}
          <code className="px-2 py-1 bg-muted rounded">/</code> for commands
        </p>
      </div>
      <Editor content={Content} />
    </main>
  )
}
