# Neuphlo Editor

A lightweight, feature-rich React wrapper around [Tiptap](https://tiptap.dev) with sensible defaults, built-in styling, and powerful image upload capabilities.

[![npm version](https://img.shields.io/npm/v/neuphlo-editor.svg)](https://www.npmjs.com/package/neuphlo-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Built for developers who want a beautiful, production-ready rich text editor without the hassle of configuration.**

## ✨ Features

- 🎨 **Beautiful defaults** - Pre-styled editor with clean, modern design
- 🖼️ **Image upload** - Integrated image support with custom upload handlers
- 📐 **Image controls** - Resize and align images with intuitive controls
- ⌨️ **Slash commands** - Quick formatting with `/` commands
- 💬 **Bubble menus** - Context-aware formatting menus
- 🎯 **TypeScript** - Full TypeScript support with type definitions
- 🎨 **Syntax highlighting** - Code blocks with highlight.js support
- 🔗 **Link management** - Easy link insertion and editing
- 📦 **Lightweight** - Minimal bundle size with tree-shaking support
- 🔌 **Extensible** - Add your own Tiptap extensions

## 📦 Installation

```bash
npm install neuphlo-editor
# or
pnpm add neuphlo-editor
# or
yarn add neuphlo-editor
```

## 🚀 Quick Start

```tsx
import { Editor } from 'neuphlo-editor'
import 'neuphlo-editor/styles.css'

function App() {
  return <Editor content="<p>Start editing...</p>" />
}
```

## 🖼️ Image Upload

One of the most powerful features is the built-in image upload system that works with **any backend**:

```tsx
import { Editor } from 'neuphlo-editor'
import 'neuphlo-editor/styles.css'

function App() {
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

### Image Features

- ✅ Upload via slash command (`/image`)
- ✅ Drag and drop images
- ✅ Paste images from clipboard
- ✅ Resize images (25%-100%)
- ✅ Align images (left, center, right)
- ✅ Replace/delete images

## 📚 Documentation

Full documentation is available in the [package README](./packages/neuphlo-editor/README.md).

### Key Topics

- [API Reference](./packages/neuphlo-editor/README.md#api-reference)
- [Image Upload Examples](./packages/neuphlo-editor/README.md#upload-handler-examples) (S3, Cloudinary, Custom)
- [Styling Guide](./packages/neuphlo-editor/README.md#styling)
- [Advanced Usage](./packages/neuphlo-editor/README.md#advanced-usage)
- [TypeScript Support](./packages/neuphlo-editor/README.md#typescript)

## 🎯 Project Structure

This is a monorepo containing:

```
neuphlo-editor/
├── packages/
│   └── neuphlo-editor/     # Main package (published to npm)
│       ├── src/
│       │   ├── headless/   # Core Tiptap extensions
│       │   ├── react/      # React components
│       │   └── styles.css  # Default styles
│       └── package.json
└── apps/
    └── web/                # Demo app (Next.js)
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/Neuphlo/neuphlo-editor.git
cd neuphlo-editor

# Install dependencies
pnpm install

# Start the demo app
cd apps/web
pnpm dev
```

The demo app will be available at http://localhost:3000

### Building the Package

```bash
cd packages/neuphlo-editor
pnpm build
```

### Publishing

```bash
cd packages/neuphlo-editor

# Update version in package.json, then:
npm publish
```

## 🎨 Tech Stack

- **[Tiptap](https://tiptap.dev)** - Headless editor framework
- **[React](https://react.dev)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Highlight.js](https://highlightjs.org/)** - Syntax highlighting
- **[Tabler Icons](https://tabler-icons.io/)** - Icon library
- **[Jotai](https://jotai.org/)** - State management
- **[CMDK](https://cmdk.paco.me/)** - Command menu

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Write TypeScript with proper types
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and descriptive

## 📝 Changelog

### v1.1.0 (Latest)

**New Features:**
- ✅ Image upload support with custom handlers
- ✅ Image resizing (25%-100% slider)
- ✅ Image alignment (left, center, right)
- ✅ ImageMenu component (auto-appears on image click)
- ✅ Drag & drop image support
- ✅ Paste image from clipboard
- ✅ `/image` slash command

**Improvements:**
- Updated description to mention image upload
- Added `@tiptap/extension-image` dependency

### v1.0.5

- Initial public release
- Text formatting (bold, italic, strike)
- Headings, lists, blockquotes
- Code blocks with syntax highlighting
- Link management
- Slash commands
- Bubble menus

## 🐛 Known Issues

None currently. Please [report issues](https://github.com/Neuphlo/neuphlo-editor/issues) if you find any!

## 📄 License

MIT © NEUPHLO

See [LICENSE](./LICENSE) for more information.

## 🙏 Acknowledgments

- [Tiptap](https://tiptap.dev) - For the amazing headless editor framework
- [ProseMirror](https://prosemirror.net/) - For the underlying editor core
- All the open source contributors who make projects like this possible

## 💬 Support

- **Documentation**: [Package README](./packages/neuphlo-editor/README.md)
- **Issues**: [GitHub Issues](https://github.com/Neuphlo/neuphlo-editor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Neuphlo/neuphlo-editor/discussions)
- **npm**: [neuphlo-editor](https://www.npmjs.com/package/neuphlo-editor)

---

**Made with ❤️ by the Neuphlo team**
