const exampleContent = /* html */ `
  <h1>Introducing Neuphlo Editor</h1>
  <p>
    Neuphlo Editor is a Notion‑style WYSIWYG editor for React, built on Tiptap.
    It ships a small, sensible preset and a typed React wrapper — easy to style
    and easy to extend.
  </p>

  <h2>Installation</h2>
  <pre><code class="language-js">npm i neuphlo-editor</code></pre>

  <h2>Usage</h2>
  <pre><code class="language-js">import { Editor } from "neuphlo-editor/react";

export default function App() {
  return &lt;Editor content={"&lt;p&gt;Hello Neuphlo&lt;/p&gt;"} /&gt;;
}</code></pre>

  <p>Style it your way with Tailwind or CSS (styles are auto‑included when importing <code>neuphlo-editor/react</code>):</p>
  <pre><code class="language-js">&lt;Editor className="min-h-[200px] border rounded-md p-3 outline-none" /&gt;</code></pre>

  <h2>Features</h2>
  <ul>
    <li>Headings 1–3, bold/italic, paragraphs</li>
    <li>Lists: bullet and numbered (keeps marks)</li>
    <li>Blockquote and code blocks</li>
    <li>Horizontal rule and inline code</li>
    <li>Keyboard shortcuts: <kbd>Cmd/Ctrl</kbd>+<kbd>B</kbd> and <kbd>Cmd/Ctrl</kbd>+<kbd>I</kbd></li>
    <li>Themeable: minimal CSS you can override</li>
    <li>Composable: extend with any Tiptap extension</li>
    <li>Type‑safe: built with TypeScript</li>
  </ul>

  <h2>Try It</h2>
  <ul>
    <li>Select some text, then use the floating menu to set a Heading, List, or Code Block.</li>
    <li>Use <kbd>Cmd/Ctrl</kbd>+<kbd>B</kbd> and <kbd>Cmd/Ctrl</kbd>+<kbd>I</kbd> to toggle formatting.</li>
    <li>Start a list with <code>-</code> or <code>1.</code></li>
    <li>Paste formatted text — it just works.</li>
  </ul>

  <hr />

  <blockquote>
    Neuphlo keeps the surface area small so you can ship content experiences
    faster without wrestling complex configs.
  </blockquote>
`

export default exampleContent
