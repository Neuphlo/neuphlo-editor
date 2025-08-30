# neuphlo-editor

A lightweight Tiptap preset with a React wrapper.

## Install

```bash
npm i neuphlo-editor
```

Requires `react` and `react-dom` 18+ in your app.

## Usage (React)

```tsx
import { Editor } from "neuphlo-editor/react"

export default function Page() {
  return <Editor content="<p>Hello</p>" />
}
```

The React Editor includes the Neuphlo preset by default. Add more TipTap extensions when needed:

```tsx
import Placeholder from "@tiptap/extension-placeholder"
;<Editor
  content="<p>Hello</p>"
  extensions={[Placeholder.configure({ placeholder: "Write something…" })]}
/>
```

### Styling

- Default behavior:

  - The component adds the `nph-editor` class by default.
  - Import our minimal stylesheet in your app to activate defaults: `import 'neuphlo-editor/styles.css'` (or `@import 'neuphlo-editor/styles.css';`).
    - Next.js App Router: `app/layout.tsx` or `app/globals.css`
    - Vite/CRA: `src/main.tsx`/`src/index.tsx`
  - The base CSS does not add a border or background; add your own if desired.

- Opt out per instance:

  - `<Editor styled={false} />`

- Bring your own styles (Tailwind or CSS):
  - Use `className` to style the content container; use `editorContainerProps` for other DOM props (e.g., `id`, `role`). No styles are injected by the package.
  - You can combine your own classes with the optional stylesheet if you want.

Examples:

```tsx
// Default stylesheet (minimal — no border/background by default)
import 'neuphlo-editor/styles.css'
<Editor />

// Tailwind utilities
<Editor className="min-h-[200px] border rounded-md p-3 outline-none" />

// Plain CSS
<Editor className="my-editor" />

/* then in your CSS */
.my-editor { min-height: 200px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; outline: none; }
.my-editor:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
```

Advanced: pass TipTap options directly (everything maps to TipTap’s `EditorProvider`). Use `className` to style the content container, and `editorContainerProps` for additional DOM attributes:

```tsx
<Editor
  autofocus
  editable={false}
  editorProps={{ attributes: { spellcheck: 'true' } }}
  editorContainerProps={{ id: 'editor', role: 'textbox' }}
/>

// Alternatively, add the class manually via props
<Editor className="nph-editor" />

### Editable

Control whether the editor is editable (matches TipTap’s `editable` option). When not editable, helpful attributes are added for styling.

<Editor editable={false} />

// With default stylesheet + a visual cue
import 'neuphlo-editor/styles.css'
<Editor editable={false} className="opacity-60" />

// You can target the state in CSS if you prefer
.nph-editor[data-disabled="true"] {
  /* e.g., make it look disabled */
  opacity: 0.6;
}
```

Notes:

- `editable` is forwarded to TipTap.
- When `editable={false}`, the content element receives `aria-disabled="true"` and `data-disabled="true"`.

## Usage (Core/Headless)

Using TipTap core directly? Compose your editor with the preset, then add your own extensions on top:

```
import { Editor } from '@tiptap/core'
import { NeuphloPreset } from 'neuphlo-editor'
import Placeholder from '@tiptap/extension-placeholder'

const editor = new Editor({
  content: '<p>Hello</p>',
  extensions: [
    ...NeuphloPreset,
    Placeholder.configure({ placeholder: 'Write something…' }),
  ],
})
```
