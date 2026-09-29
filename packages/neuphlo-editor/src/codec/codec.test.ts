import { describe, expect, it } from "vitest"
import { PAGE_CODEC_VERSION, PAGE_YJS_FIELD, pageJSONToYDoc, pageYDocToJSON, parsePageJSON, parsePageMarkdown, serializePageMarkdown } from "./index"

const examples = [
  "# Project plan\n\nA **bold** and *italic* [link](https://example.com) with ~~old~~ text.",
  "> A note\n\n- One\n- Two\n\n1. First\n2. Second",
  "## Code\n\n```ts\nconst value = 2\n```\n\n---\n\nLine one\\\nline two",
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
    ["task", "- [ ] Todo"],
    ["image", "![Sketch](https://example.com/image.png)"],
    ["table", "| A | B |\n|---|---|\n| 1 | 2 |"],
    ["html", "<u>Underline</u>"],
    ["video", "<div data-type=\"video-block\"></div>"],
  ])("rejects unsupported %s Markdown", (_name, markdown) => {
    expect(parsePageMarkdown(markdown)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
  })

  it("rejects unknown nodes, marks, attributes, and versions", () => {
    expect(parsePageJSON({ type: "doc", content: [{ type: "videoBlock" }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph", attrs: { align: "center" } }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsePageJSON({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "underline" }] }] }] }, 1)).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
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
