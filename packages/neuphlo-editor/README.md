# Neuphlo Editor

A lightweight, feature-rich React wrapper around [Tiptap](https://tiptap.dev) with sensible defaults, built-in styling, and powerful image upload capabilities.

[![npm version](https://img.shields.io/npm/v/neuphlo-editor.svg)](https://www.npmjs.com/package/neuphlo-editor)
[![License](https://img.shields.io/npm/l/neuphlo-editor.svg)](https://github.com/Neuphlo/neuphlo-editor/blob/main/LICENSE)

## Features

- 🎨 **Beautiful defaults** - Pre-styled editor with clean, modern design
- 🖼️ **Image upload** - Integrated image support with custom upload handlers
- 📐 **Image controls** - Resize and align images with intuitive controls
- ⌨️ **Slash commands** - Quick formatting with `/` commands
- 💬 **Bubble menus** - Context-aware formatting menus
- 🎯 **TypeScript** - Full TypeScript support with type definitions
- 🎨 **Syntax highlighting** - Code blocks with highlight.js support
- 🔗 **Link management** - Easy link insertion and editing
- 📦 **Lightweight** - Minimal bundle size with tree-shaking support

## Installation

```bash
npm install neuphlo-editor
# or
pnpm add neuphlo-editor
# or
yarn add neuphlo-editor
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install react react-dom @tiptap/react @tiptap/pm
```

## Quick Start

```tsx
import { Editor } from 'neuphlo-editor'
import 'neuphlo-editor/styles.css'

function MyApp() {
  return <Editor content="<p>Start editing...</p>" />
}
```

## Image Upload

Neuphlo Editor makes it easy to add image upload functionality with your own backend:

```tsx
import { Editor } from 'neuphlo-editor'
import 'neuphlo-editor/styles.css'

function MyApp() {
  const handleImageUpload = async (file: File): Promise<string> => {
    // Upload to your backend (S3, Cloudinary, custom API, etc.)
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const { url } = await response.json()
    return url // Return the permanent image URL
  }

  return <Editor uploadImage={handleImageUpload} />
}
```

### Image Upload Methods

Users can insert images in multiple ways:

1. **Slash command** - Type `/image` and press Enter
2. **Image menu** - Click the upload button in the image bubble menu
3. **Drag & drop** - Drag image files directly into the editor
4. **Paste** - Copy and paste images from clipboard

### Image Controls

When an image is selected, a bubble menu appears with controls to:

- **Resize** - Adjust size from 25% to 100% with a slider
- **Align** - Position left, center, or right
- **Replace** - Upload a new image
- **Delete** - Remove the image

## Upload Handler Examples

### AWS S3

```tsx
const handleImageUpload = async (file: File): Promise<string> => {
  // Get presigned URL from your API
  const response = await fetch('/api/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  })

  const { uploadUrl, imageUrl } = await response.json()

  // Upload to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  return imageUrl
}
```

### Cloudinary

```tsx
const handleImageUpload = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'your_upload_preset')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()
  return data.secure_url
}
```

### Convex

```tsx
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

function MyEditor() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const handleImageUpload = async (file: File): Promise<string> => {
    // Step 1: Get a short-lived upload URL
    const uploadUrl = await generateUploadUrl()

    // Step 2: POST the file to the URL
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    const { storageId } = await result.json()

    // Step 3: Save the storage ID to your database (optional)
    // await saveImage({ storageId, name: file.name })

    // Step 4: Return the public URL
    // You can use getUrl mutation or construct the URL
    const imageUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`
    return imageUrl
  }

  return <Editor uploadImage={handleImageUpload} />
}
```

**Convex backend (convex/files.ts):**

```tsx
import { mutation } from './_generated/server'

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
})

export const getUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  },
})
```

### Custom Backend

```tsx
const handleImageUpload = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const { url } = await response.json()
  return url
}
```

## API Reference

### Editor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `""` | Initial HTML content |
| `className` | `string` | `undefined` | CSS class for the editor wrapper |
| `editable` | `boolean` | `true` | Whether the editor is editable |
| `immediatelyRender` | `boolean` | `false` | Render immediately on mount |
| `showTextMenu` | `boolean` | `true` | Show text formatting bubble menu |
| `showImageMenu` | `boolean` | `true` | Show image controls bubble menu |
| `showSlashMenu` | `boolean` | `true` | Show slash command menu |
| `extensions` | `Extension[]` | `[]` | Additional Tiptap extensions |
| `uploadImage` | `(file: File) => Promise<string>` | `undefined` | Image upload handler |
| `onUpdate` | `({ editor }) => void` | `undefined` | Called when content changes |
| `onCreate` | `({ editor }) => void` | `undefined` | Called when editor is created |

### Example with Props

```tsx
<Editor
  content="<p>Hello world!</p>"
  className="my-editor"
  editable={true}
  showTextMenu={true}
  showImageMenu={true}
  showSlashMenu={true}
  uploadImage={handleImageUpload}
  onUpdate={({ editor }) => {
    const html = editor.getHTML()
    console.log('Content updated:', html)
  }}
  onCreate={({ editor }) => {
    console.log('Editor created:', editor)
  }}
/>
```

## Styling

### Basic Styling

Import the default styles in your app:

```tsx
import 'neuphlo-editor/styles.css'
```

### Syntax Highlighting (Optional)

For code block syntax highlighting, import the highlight.js theme:

```tsx
import 'neuphlo-editor/styles.css'
import 'neuphlo-editor/highlight.css'
```

Or use any other highlight.js theme:

```tsx
import 'neuphlo-editor/styles.css'
import 'highlight.js/styles/github-dark.css'
```

### Custom Styling

All styles are namespaced with `.nph-` prefix to avoid conflicts. You can override them:

```css
.nph-editor {
  min-height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.nph-editor img {
  max-width: 100%;
  border-radius: 0.5rem;
}
```

## Available Features

### Text Formatting

- **Bold** (`Ctrl+B` / `Cmd+B`)
- **Italic** (`Ctrl+I` / `Cmd+I`)
- **Strike** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
- **Code** (inline code)

### Blocks

- Headings (H1-H6)
- Bullet lists
- Ordered lists
- Blockquotes
- Code blocks with syntax highlighting

### Slash Commands

Type `/` to open the command menu:

- `/bold` - Bold text
- `/italic` - Italic text
- `/strike` - Strikethrough
- `/h1` - Heading 1
- `/h2` - Heading 2
- `/h3` - Heading 3
- `/h4` - Heading 4
- `/list` - Bullet list
- `/ol` - Ordered list
- `/quote` - Blockquote
- `/code` - Inline code
- `/codeblock` - Code block
- `/image` - Insert image

### Links

- Insert/edit links via the bubble menu
- Open links in new tab
- Remove links

### Images

- Upload via slash command (`/image`)
- Drag and drop images
- Paste images from clipboard
- Resize images (25%-100%)
- Align images (left, center, right)
- Replace images
- Delete images

## Advanced Usage

### Custom Extensions

Add your own Tiptap extensions:

```tsx
import { Editor } from 'neuphlo-editor'
import { Underline } from '@tiptap/extension-underline'

<Editor
  extensions={[Underline]}
  content="<p>Now you can <u>underline</u> text!</p>"
/>
```

### Accessing the Editor Instance

```tsx
import { useRef } from 'react'
import { Editor } from 'neuphlo-editor'

function MyApp() {
  const editorRef = useRef(null)

  const handleCreate = ({ editor }) => {
    editorRef.current = editor
  }

  const getContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML()
      const json = editorRef.current.getJSON()
      console.log('HTML:', html)
      console.log('JSON:', json)
    }
  }

  return (
    <>
      <Editor onCreate={handleCreate} />
      <button onClick={getContent}>Get Content</button>
    </>
  )
}
```

### Controlled Content

```tsx
import { useState } from 'react'
import { Editor } from 'neuphlo-editor'

function MyApp() {
  const [content, setContent] = useState('<p>Initial content</p>')

  return (
    <Editor
      content={content}
      onUpdate={({ editor }) => {
        setContent(editor.getHTML())
      }}
    />
  )
}
```

## Error Handling

Handle upload errors gracefully:

```tsx
const handleImageUpload = async (file: File): Promise<string> => {
  try {
    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Upload logic
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const { url } = await response.json()
    return url
  } catch (error) {
    console.error('Image upload error:', error)
    // You might want to show a toast notification here
    throw error
  }
}
```

## TypeScript

The package is fully typed with TypeScript:

```tsx
import type { Editor as TiptapEditor } from '@tiptap/core'
import { Editor } from 'neuphlo-editor'

type UploadImageFn = (file: File) => Promise<string>

const handleImageUpload: UploadImageFn = async (file) => {
  // Your upload logic
  return 'https://example.com/image.jpg'
}

function MyApp() {
  const handleCreate = ({ editor }: { editor: TiptapEditor }) => {
    console.log('Editor created:', editor)
  }

  return (
    <Editor
      uploadImage={handleImageUpload}
      onCreate={handleCreate}
    />
  )
}
```

## Browser Support

Neuphlo Editor works in all modern browsers that support:
- FileReader API
- Drag and Drop API
- Clipboard API

Supported browsers:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/Neuphlo/neuphlo-editor/issues).
