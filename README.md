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

Pick one of the following:

- Default stylesheet (opt-in, minimal):
  - Import once in your app: `import 'neuphlo-editor/styles.css'`
  - Opt-in per instance with `<Editor styled />` or add `className="nph-editor"` yourself.
  - The base CSS does not add a border or background; add your own if desired.

- Bring your own styles (Tailwind or CSS):
  - Pass any DOM props directly (e.g., `className`, `id`); no styles are injected.
  - You can combine your own `className` with the default stylesheet if you want.

Examples:

```tsx
// Default stylesheet (opt-in, minimal — no border/background by default)
import 'neuphlo-editor/styles.css'
<Editor styled />

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

// Alternatively, add the class manually
<Editor className="nph-editor" />
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
