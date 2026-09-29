import { Editor } from "@tiptap/core"
import { describe, expect, it } from "vitest"
import { ExtensionKit } from "../headless/extensions/extension-kit"
import { markdownToHtml } from "../headless/extensions/Markdown"
import { PAGE_CODEC_VERSION, pageJSONToYDoc, pageYDocToJSON, parsePageJSON, serializePageMarkdown } from "./index"

const supportedMarkdown = [
  "# Heading\n\nA **bold** and *italic* [link](https://example.com) with ~~strike~~ and `code`.",
  "> Quoted text\n\n- First\n- Second\n\n3. Third\n4. Fourth",
  "```ts\nconst value = 2\n```\n\n---\n\nLine one\\\nline two",
]

describe("Page codec compatibility with the installed editor", () => {
  it.each(supportedMarkdown)("round-trips supported editor JSON without dropping content", markdown => {
    const editor = new Editor({
      extensions: ExtensionKit({ slashCommand: false, dragHandle: false, table: false }),
      content: markdownToHtml(markdown),
    })
    try {
      const json = editor.getJSON()
      const parsed = parsePageJSON(json, PAGE_CODEC_VERSION)
      expect(parsed, JSON.stringify({ json, parsed })).toMatchObject({ ok: true })
      if (!parsed.ok) return
      const encoded = pageJSONToYDoc(json, PAGE_CODEC_VERSION)
      expect(encoded).toMatchObject({ ok: true })
      if (!encoded.ok) return
      const decoded = pageYDocToJSON(encoded.value, PAGE_CODEC_VERSION)
      expect(decoded).toMatchObject({ ok: true, value: json })
      if (!decoded.ok) return
      const rendered = serializePageMarkdown(decoded.value, PAGE_CODEC_VERSION)
      expect(rendered, JSON.stringify({ json, rendered })).toMatchObject({ ok: true })
    } finally {
      editor.destroy()
    }
  })

  it.each([
    "- [ ] Task",
    "![Image](https://example.com/image.png)",
    "[▶ Video](https://youtu.be/abc123)",
  ])("fails closed for unsupported editor content", markdown => {
    const editor = new Editor({
      extensions: ExtensionKit({ slashCommand: false, dragHandle: false }),
      content: markdownToHtml(markdown),
    })
    try {
      expect(parsePageJSON(editor.getJSON(), PAGE_CODEC_VERSION)).toMatchObject({
        ok: false,
        error: { code: "unsupported_content" },
      })
    } finally {
      editor.destroy()
    }
  })

  it.each(["mention", "reference"])("rejects %s nodes instead of flattening their semantics", type => {
    const json = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type, attrs: { id: "person-1", label: "Alex" } }] }],
    }
    expect(parsePageJSON(json, PAGE_CODEC_VERSION)).toMatchObject({
      ok: false,
      error: { code: "unsupported_content" },
    })
    expect(pageJSONToYDoc(json, PAGE_CODEC_VERSION)).toMatchObject({
      ok: false,
      error: { code: "unsupported_content" },
    })
  })
})
