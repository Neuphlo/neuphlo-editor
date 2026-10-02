import { describe, expect, it } from "vitest"
import * as Y from "yjs"
import { prosemirrorJSONToYDoc } from "@tiptap/y-tiptap"
import { PAGE_CODEC_VERSION, PAGE_MAX_MARKDOWN_LENGTH, PAGE_MAX_STATE_BYTES, PAGE_YJS_FIELD, markdownToPageYjsState, pageJSONToYDoc, pageYDocToJSON, pageYjsStateToMarkdown, pageSchema, parsePageJSON, parsePageMarkdown, serializePageMarkdown } from "./index"

const examples = [
  "# Project plan\n\nA **bold** and *italic* [link](https://example.com) with ~~old~~ text.",
  "> A note\n\n- One\n- Two\n\n1. First\n2. Second",
  "## Code\n\n```ts\nconst value = 2\n```\n\n---\n\nLine one\\\nline two",
  "- [ ] Task\n- [x] Done",
  "| A | B |\n| --- | --- |\n| one | two |",
  "![Alt](https://example.com/a.png)",
  "[▶ Video](https://youtu.be/abc123)",
  "<u>Underlined</u>",
]

describe("Page codec v1", () => {
  it.each(examples)("preserves rich Markdown through PM and Yjs", markdown => {
    const parsed = parsePageMarkdown(markdown)
    expect(parsed).toMatchObject({ ok: true, version: PAGE_CODEC_VERSION })
    if (!parsed.ok) return
    const encoded = pageJSONToYDoc(parsed.value.toJSON(), PAGE_CODEC_VERSION)
    expect(encoded.ok).toBe(true)
    if (!encoded.ok) return
    expect(encoded.value.getXmlFragment(PAGE_YJS_FIELD).length).toBeGreaterThan(0)
    const decoded = pageYDocToJSON(encoded.value, PAGE_CODEC_VERSION)
    expect(decoded).toMatchObject({ ok: true, value: parsed.value.toJSON() })
    if (!decoded.ok) return
    const rendered = serializePageMarkdown(decoded.value, PAGE_CODEC_VERSION)
    expect(rendered.ok).toBe(true)
    if (!rendered.ok) return
    const again = parsePageMarkdown(rendered.value)
    expect(again.ok && again.value.toJSON()).toEqual(parsed.value.toJSON())
  })

  it.each([
    ["script", "<script>globalThis.codecExecuted = true</script>"],
    ["style", "<style>body{display:none}</style>"],
    ["event handler", "<img src=\"https://example.com/a.png\" onerror=\"globalThis.codecExecuted = true\">"],
    ["unknown node", "<iframe src=\"https://example.com\"></iframe>"],
    ["invalid whitespace marker", "<p data-page-whitespace=\"false\">text </p>"],
  ])("rejects unsupported %s Markdown", (_name, markdown) => {
    const previous = (globalThis as { codecExecuted?: boolean }).codecExecuted
    expect(parsePageMarkdown(markdown)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect((globalThis as { codecExecuted?: boolean }).codecExecuted).toBe(previous)
  })

  it.each(examples)("restores rich Markdown from exact Yjs bytes in Node", markdown => {
    const encoded = markdownToPageYjsState(markdown)
    expect(encoded.ok).toBe(true)
    if (!encoded.ok) return
    const restored = pageYjsStateToMarkdown(encoded.value, PAGE_CODEC_VERSION)
    expect(restored.ok).toBe(true)
    if (!restored.ok) return
    const expected = parsePageMarkdown(markdown)
    const actual = parsePageMarkdown(restored.value)
    expect(actual.ok && actual.value.toJSON()).toEqual(expected.ok && expected.value.toJSON())
  })

  it.each(["*first\\\nsecond*", "**first\\\nsecond**", "<em>first<br>second</em>"])("normalizes formatting marks on hard breaks without changing adjacent text", markdown => {
    const parsed = parsePageMarkdown(markdown)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const paragraph = parsed.value.toJSON().content[0]
    expect(paragraph.content[0].marks).toBeDefined()
    expect(paragraph.content[1]).toEqual({ type: "hardBreak" })
    expect(paragraph.content[2].marks).toEqual(paragraph.content[0].marks)
    const encoded = markdownToPageYjsState(markdown)
    expect(encoded.ok).toBe(true)
    if (!encoded.ok) return
    const projected = pageYjsStateToMarkdown(encoded.value, PAGE_CODEC_VERSION)
    expect(projected.ok).toBe(true)
    if (!projected.ok) return
    const restored = parsePageMarkdown(projected.value)
    expect(restored.ok && restored.value.toJSON()).toEqual(parsed.value.toJSON())
  })

  it("rejects invalid hard-break marks before normalization", () => {
    const invalid = { type: "doc", content: [{ type: "paragraph", content: [{ type: "hardBreak", marks: [{ type: "unknownMark" }] }] }] }
    expect(parsePageJSON(invalid, PAGE_CODEC_VERSION)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
  })

  it("projects a live Yjs document containing a marked hard break", () => {
    const json = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "first", marks: [{ type: "italic" }] }, { type: "hardBreak", marks: [{ type: "italic" }] }, { type: "text", text: "second", marks: [{ type: "italic" }] }] }] }
    const doc = prosemirrorJSONToYDoc(pageSchema, json, PAGE_YJS_FIELD)
    try {
      const projected = pageYjsStateToMarkdown(Y.encodeStateAsUpdate(doc), PAGE_CODEC_VERSION)
      expect(projected.ok).toBe(true)
      if (!projected.ok) return
      const restored = parsePageMarkdown(projected.value)
      expect(restored.ok && restored.value.toJSON().content[0].content).toEqual([
        { type: "text", marks: [{ type: "italic" }], text: "first" },
        { type: "hardBreak" },
        { type: "text", marks: [{ type: "italic" }], text: "second" },
      ])
    } finally {
      doc.destroy()
    }
  })

  it("preserves each typed boundary space before the next letter", () => {
    const encoded = pageJSONToYDoc({ type: "doc", content: [{ type: "paragraph" }] }, PAGE_CODEC_VERSION)
    expect(encoded.ok).toBe(true)
    if (!encoded.ok) return
    try {
      const paragraph = encoded.value.getXmlFragment(PAGE_YJS_FIELD).get(0) as Y.XmlElement
      const text = new Y.XmlText()
      paragraph.insert(0, [text])
      let expected = ""
      for (const part of [" ", "First", " ", "editor", " ", "checked.", " ", "!"]) {
        text.insert(text.length, part)
        expected += part
        const bytes = Y.encodeStateAsUpdate(encoded.value)
        const projected = pageYjsStateToMarkdown(bytes, PAGE_CODEC_VERSION)
        expect(projected, expected).toMatchObject({ ok: true })
        if (!projected.ok) continue
        const restored = parsePageMarkdown(projected.value)
        expect(restored.ok && restored.value.toJSON(), expected).toEqual({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: expected }] }] })
        expect(Y.encodeStateAsUpdate(encoded.value)).toEqual(bytes)
      }
    } finally {
      encoded.value.destroy()
    }
  })

  it.each([
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Heading " }] },
    { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "List " }] }] }] },
    { type: "table", content: [{ type: "tableRow", content: [{ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Cell " }] }] }] }] },
  ])("round-trips trailing spaces inside $type", block => {
    const json = { type: "doc", content: [block] }
    const projected = serializePageMarkdown(json, PAGE_CODEC_VERSION)
    expect(projected).toMatchObject({ ok: true })
    if (!projected.ok) return
    const restored = parsePageMarkdown(projected.value)
    const expected = parsePageJSON(json, PAGE_CODEC_VERSION)
    expect(restored.ok && restored.value.toJSON()).toEqual(expected.ok && expected.value.toJSON())
  })

  it("bounds Markdown and binary state before parsing", () => {
    expect(parsePageMarkdown("x".repeat(PAGE_MAX_MARKDOWN_LENGTH + 1))).toMatchObject({ ok: false, error: { detail: "markdown:too_large" } })
    expect(pageYjsStateToMarkdown(new Uint8Array(PAGE_MAX_STATE_BYTES + 1), PAGE_CODEC_VERSION)).toMatchObject({ ok: false, error: { detail: "yjs:too_large" } })
  })

  it("rejects unknown nodes, marks, attributes, and versions", () => {
    expect(parsePageJSON({ type: "doc", content: [{ type: "unrecognizedBlock" }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph", attrs: { align: "center" } }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "unrecognizedMark" }] }] }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph" }] }, 2)).toMatchObject({ ok: false, error: { code: "unsupported_version" } })
  })

  it("rejects unsafe and malformed JSON links", () => {
    const linked = (href: unknown, title: unknown = null) => ({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "link", marks: [{ type: "link", attrs: { href, title } }] }] }],
    })
    expect(parsePageJSON(linked("javascript:alert(1)"), 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON(linked(42), 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON(linked("https://example.com", { bad: true }), 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
  })

  it("rejects fields ProseMirror would silently discard", () => {
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", content: [{ type: "text", text: "y" }] }] }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph", text: "hidden" }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph", marks: [{ type: "bold" }] }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
  })
})
