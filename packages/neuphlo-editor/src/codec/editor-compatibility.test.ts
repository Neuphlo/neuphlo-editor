import { Editor } from "@tiptap/core"
import { describe, expect, it } from "vitest"
import { ExtensionKit } from "../headless/extensions/extension-kit"
import { markdownToHtml } from "../headless/extensions/Markdown"
import { PAGE_CODEC_VERSION, pageJSONToYDoc, pageSchema, pageYDocToJSON, parsePageJSON, parsePageMarkdown, serializePageMarkdown } from "./index"

const supportedMarkdown = [
  "# Heading\n\nA **bold** and *italic* [link](https://example.com) with ~~strike~~ and `code`.",
  "> Quoted text\n\n- First\n- Second\n\n3. Third\n4. Fourth",
  "```ts\nconst value = 2\n```\n\n---\n\nLine one\\\nline two",
  "- [ ] Task\n- [x] Done",
  "| A | B |\n| --- | --- |\n| one | two |",
  "![Alt](https://example.com/a.png)",
  "[▶ Video](https://youtu.be/abc123)",
  "<u>Underlined</u>",
]

describe("Page codec compatibility with the installed editor", () => {
  it("tracks the complete Page editor schema", () => {
    const editor = new Editor({ extensions: ExtensionKit({ slashCommand: false, dragHandle: false }) })
    try {
      expect(Object.keys(pageSchema.nodes).sort()).toEqual(Object.keys(editor.schema.nodes).sort())
      expect(Object.keys(pageSchema.marks).sort()).toEqual(Object.keys(editor.schema.marks).sort())
      for (const [name, type] of Object.entries(editor.schema.nodes)) {
        const actual = pageSchema.nodes[name].spec.attrs ?? {}
        const expected = type.spec.attrs ?? {}
        expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort())
        for (const attribute of Object.keys(expected)) expect(actual[attribute].default).toEqual(expected[attribute].default)
      }
      for (const [name, type] of Object.entries(editor.schema.marks)) {
        const actual = pageSchema.marks[name].spec.attrs ?? {}
        const expected = type.spec.attrs ?? {}
        expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort())
        for (const attribute of Object.keys(expected)) expect(actual[attribute].default).toEqual(expected[attribute].default)
      }
    } finally {
      editor.destroy()
    }
  })

  it.each(supportedMarkdown)("round-trips supported editor JSON without dropping content", markdown => {
    const editor = new Editor({
      extensions: ExtensionKit({ slashCommand: false, dragHandle: false }),
      content: markdownToHtml(markdown),
    })
    try {
      const json = editor.getJSON()
      const imported = parsePageMarkdown(markdown)
      expect(imported.ok && imported.value.toJSON(), JSON.stringify({ markdown, json, imported: imported.ok ? imported.value.toJSON() : imported })).toEqual(json)
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

  it("preserves resized table cells from the installed editor", () => {
    const editor = new Editor({ extensions: ExtensionKit({ slashCommand: false, dragHandle: false }) })
    try {
      editor.commands.setContent({
        type: "doc",
        content: [{
          type: "table",
          content: [{
            type: "tableRow",
            content: [{ type: "tableCell", attrs: { colspan: 1, rowspan: 1, colwidth: [120] }, content: [{ type: "paragraph", content: [{ type: "text", text: "Wide" }] }] }],
          }],
        }],
      })
      const json = editor.getJSON()
      const markdown = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()
      const imported = parsePageMarkdown(markdown)
      expect(imported.ok && imported.value.toJSON().content?.[0], JSON.stringify({ markdown, json, imported: imported.ok ? imported.value.toJSON() : imported })).toEqual(json.content?.[0])
      const serialized = serializePageMarkdown(json, PAGE_CODEC_VERSION)
      expect(serialized.ok, JSON.stringify({ json, serialized })).toBe(true)
      if (serialized.ok) {
        const restored = parsePageMarkdown(serialized.value)
        expect(restored.ok && restored.value.toJSON()).toEqual(json)
      }
    } finally {
      editor.destroy()
    }
  })
})
