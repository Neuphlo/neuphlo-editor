# Neuphlo Monorepo

This repo is an npm workspaces monorepo with:

- packages/neuphlo-editor: the editor package (TipTap preset + React wrapper)
- apps/playground: a private Vite app to test the package locally

## Prerequisites

- Node 18+ (recommended) and npm 8+

## Install & Run

- Install dependencies: `npm install`
- Start local dev (watch + playground): `npm run dev`
  - Package builds in watch mode via `tsup`
  - Playground starts on `http://localhost:5173` and uses the local package

## Where Things Live

- Package source: `packages/neuphlo-editor/src`
  - Build output: `packages/neuphlo-editor/dist`
  - Exports: JS (ESM/CJS), types, and `styles.css`
- Playground app: `apps/playground`
  - Entry: `apps/playground/src/main.tsx`
  - Demo component: `apps/playground/src/App.tsx`

## Developing the Editor

- Edit TypeScript/React files in `packages/neuphlo-editor/src`.
- In dev, the package rebuilds automatically and the playground reloads.
- CSS note: `styles.css` is copied to `dist` after each package build. If you change only CSS, run `npm -w neuphlo-editor run build:css` (or make any TS change) to refresh it.

## Testing in the Playground

- The playground imports the library just like a consumer app would:
  - `import { Editor } from 'neuphlo-editor/react'`
  - `import 'neuphlo-editor/styles.css'`
- Modify `apps/playground/src/App.tsx` to try different configurations and extensions.

## Using In Your App

- Install the package in your app, then import:
  - `import { Editor } from 'neuphlo-editor/react'`
  - `import 'neuphlo-editor/styles.css'`
  - Or bring your own styles and set `className` on the component.

