import { Editor } from 'neuphlo-editor/react'
import Placeholder from '@tiptap/extension-placeholder'

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
        Neuphlo Editor Playground
      </h1>
      <Editor
        content="<p>Hello Neuphlo</p>"
        extensions={[Placeholder.configure({ placeholder: 'Write something…' })]}
        className="min-h-[200px] border rounded-md p-3 outline-none"
      />
    </div>
  )
}

