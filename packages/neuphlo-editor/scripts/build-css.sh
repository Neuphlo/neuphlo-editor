#!/usr/bin/env bash
set -e

# Ensure dist exists
mkdir -p dist

if command -v tailwindcss >/dev/null 2>&1; then
  tailwindcss -i src/ui.css -o dist/styles.css --minify
else
  # Fallback: ship base styles only (no UI classes)
  cp src/styles.css dist/styles.css
fi

