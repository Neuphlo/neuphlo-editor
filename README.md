# neuphlo-editor

A lightweight Tiptap preset with a React wrapper.

## Install

```bash
npm i neuphlo-editor
```

Requires `react` and `react-dom` 18+ in your app.

## Usage (React)

```tsx
import { Editor } from 'neuphlo-editor/react'

export default function Page() {
  return <Editor content="<p>Hello</p>" />
}
```

### Styling

No styles are injected by this package. Bring your own styles using either Tailwind utilities or plain CSS. Any extra props you pass (like `className`, `id`, `data-*`) are applied to the underlying Tiptap `EditorContent` div.

Examples:

```tsx
// Tailwind utilities
<Editor className="min-h-[200px] border rounded-md p-3 outline-none" />

// Plain CSS
<Editor className="my-editor" />

/* then in your CSS */
.my-editor { min-height: 200px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; outline: none; }
.my-editor:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
```

Advanced: pass DOM props directly (applied to `EditorContent`) and `editorProps` (forwarded to Tiptap’s editor):

```tsx
<Editor id="editor" role="textbox" editorProps={{ attributes: { spellcheck: 'true' } }} />
```

## Usage (headless)

```ts
import { NeuphloPreset } from 'neuphlo-editor'
```

## Development

Build the package:

```bash
npm run build
```
