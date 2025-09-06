# Neuphlo Monorepo

This repository uses npm workspaces.

- Packages: `packages/*` (library packages)
- Apps: `apps` (Next.js app)

Current packages:
- `packages/neuphlo-editor` — TipTap preset + React wrapper

Common scripts:
- `npm run build` — Builds all workspaces
- `npm run dev` — Starts the library watcher and the Next.js app together

After this restructure, run `npm install` at the repo root to refresh the lockfile and hoist dependencies.
