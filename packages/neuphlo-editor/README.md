Neuphlo Editor
===============

Lightweight React wrapper around Tiptap with sensible defaults.

CSS integration
----------------

- Import global CSS once near your app root:
  import 'neuphlo-editor/styles.css';

Highlight.js theme (optional)
-----------------------------
- We no longer inject a theme by default. If you want a default theme, also import:
  import 'neuphlo-editor/highlight.css';
- Or import any other `highlight.js` theme you prefer.

Notes
-----
- All styles are namespaced (e.g., `.nph-editor`) to avoid colliding with your app.
