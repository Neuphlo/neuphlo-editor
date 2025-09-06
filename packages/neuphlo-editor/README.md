# Neuphlo Editor

This repo is the `neuphlo-editor` package (TipTap preset + React wrapper).

## Prerequisites

- Node 18+ (recommended) and npm 8+
- React 19+ in your app

## Install & Run (local dev)

- Install dependencies: `npm install`
- Start local dev (watch): `npm run dev`
  - The package builds in watch mode via `tsup`.

## Where Things Live

- Source: `src`
  - Build output: `dist`
  - Exports: JS (ESM/CJS), types, and `styles.css`

## Using In Your App

- Install the package in your app, then import:
  - `import { Editor } from 'neuphlo-editor/react'`
  - `import 'neuphlo-editor/styles.css'`
  - Or bring your own styles and set `className` on the component.
