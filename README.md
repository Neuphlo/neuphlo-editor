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

## Usage (headless)

```ts
import { NeuphloPreset } from 'neuphlo-editor'
```

## Development

Build the package:

```bash
npm run build
```
