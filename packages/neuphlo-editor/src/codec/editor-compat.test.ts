import { describe, expect, it } from "vitest"
import { Editor } from "@tiptap/core"
import { ExtensionKit } from "../headless/extensions/extension-kit"
import { markdownToHtml } from "../headless/extensions/Markdown"
import { PAGE_CODEC_VERSION, parsePageJSON, parsePageMarkdown } from "./index"

describe("Page codec compatibility boundary", () => {
  it("accepts the current editor JSON for the supported text subset", () => {
    const markdown = "# Title\n\nA **bold** [link](https://example.com) and a list:\n\n- One\n- Two"
    const editor = new Editor({
      extensions: ExtensionKit({ slashCommand: false, dragHandle: false }),
      content: markdownToHtml(markdown),
    })
    const editorJSON = editor.getJSON()
    editor.destroy()
    const parsed = parsePageJSON(editorJSON, PAGE_CODEC_VERSION)
    expect(parsed).toMatchObject({ ok: true })
    const fromMarkdown = parsePageMarkdown(markdown)
    expect(fromMarkdown.ok).toBe(true)
    if (parsed.ok && fromMarkdown.ok) expect(parsed.value.toJSON()).toEqual(fromMarkdown.value.toJSON())
  })

  it("preserves current editor media instead of flattening it", () => {
    const editor = new Editor({
      extensions: ExtensionKit({ slashCommand: false, dragHandle: false }),
      content: markdownToHtml("[▶ Video](https://youtu.be/abc123)"),
    })
    const editorJSON = editor.getJSON()
    editor.destroy()
    const parsed = parsePageJSON(editorJSON, PAGE_CODEC_VERSION)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(parsed.value.toJSON()).toEqual(editorJSON)
  })
})
