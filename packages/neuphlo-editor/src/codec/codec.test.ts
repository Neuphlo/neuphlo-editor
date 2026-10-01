import { describe, expect, it } from "vitest"
import { PAGE_CODEC_VERSION, PAGE_MAX_MARKDOWN_LENGTH, PAGE_MAX_STATE_BYTES, PAGE_YJS_FIELD, markdownToPageYjsState, pageJSONToYDoc, pageYDocToJSON, pageYjsStateToMarkdown, parsePageJSON, parsePageMarkdown, serializePageMarkdown } from "./index"

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
