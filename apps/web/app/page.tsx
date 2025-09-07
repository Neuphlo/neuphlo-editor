"use client"

import { Editor } from "neuphlo-editor/react"
import "neuphlo-editor/styles.css"

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-5xl">Neuphlo Editor Demo</h1>
      <Editor content="<h2>Welcome</h2><p>Start typing…</p>" />
    </main>
  )
}
