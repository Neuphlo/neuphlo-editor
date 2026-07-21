import { describe, expect, it } from "vitest"
import { Editor, type JSONContent } from "@tiptap/core"
import { ExtensionKit } from "../extension-kit"
import { markdownToHtml, type MarkdownStorage } from "../Markdown"

function createEditor(markdown: string): Editor {
  return new Editor({
    extensions: ExtensionKit({ slashCommand: false, dragHandle: false }),
    content: markdownToHtml(markdown),
  })
}

function toMarkdown(markdown: string): string {
  const editor = createEditor(markdown)
  const storage = (editor.storage as unknown as { markdown: MarkdownStorage })
    .markdown
  const out = storage.getMarkdown().trim()
  editor.destroy()
  return out
}

function toJSON(markdown: string): JSONContent {
  const editor = createEditor(markdown)
  const json = editor.getJSON()
  editor.destroy()
  return json
}

function collectNodes(doc: JSONContent, type: string): JSONContent[] {
  const found: JSONContent[] = []
  const walk = (node: JSONContent) => {
    if (node.type === type) found.push(node)
    node.content?.forEach(walk)
  }
  walk(doc)
  return found
}

describe("video block", () => {
  it("round-trips a video link idempotently without producing a link", () => {
    const input = "[▶ Video](https://youtu.be/abc123)"
    const html = markdownToHtml(input)
    expect(html).toContain('data-type="video-block"')
    expect(html).toContain('data-src="https://youtu.be/abc123"')
    expect(html).not.toContain("<a")

    expect(toMarkdown(input)).toBe(input)
  })

  it("round-trips the empty-src placeholder and yields an empty src", () => {
    const input = "[▶ Video](https://)"
    const html = markdownToHtml(input)
    expect(html).toContain('data-src=""')

    const videoBlocks = collectNodes(toJSON(input), "videoBlock")
    expect(videoBlocks).toHaveLength(1)
    expect(videoBlocks[0].attrs?.src).toBe("")

    expect(toMarkdown(input)).toBe(input)
  })

  it("parses a video block with default width and alignment", () => {
    const videoBlocks = collectNodes(
      toJSON("[▶ Video](https://player.vimeo.com/video/123)"),
      "videoBlock",
    )
    expect(videoBlocks[0].attrs).toMatchObject({
      src: "https://player.vimeo.com/video/123",
      width: "100%",
      align: "center",
    })
  })

  it("leaves an inline video-style link as a link", () => {
    const html = markdownToHtml("See [▶ Video](https://example.com) for details")
    expect(html).toContain("<a href=")
    expect(html).not.toContain("video-block")
  })
})

describe("task list", () => {
  it("round-trips unchecked and checked items idempotently", () => {
    expect(toMarkdown("- [ ] a")).toBe("- [ ] a")
    expect(toMarkdown("- [x] b")).toBe("- [x] b")
  })

  it("round-trips a nested task list with four-space indentation", () => {
    const input = "- [ ] a\n- [x] b\n    - [ ] c"
    expect(toMarkdown(input)).toBe(input)
  })

  it("parses items into taskList and taskItem with correct checked attrs", () => {
    const html = markdownToHtml("- [ ] a\n- [x] b")
    expect(html).toContain('<ul data-type="taskList">')
    expect(html).toContain('<li data-type="taskItem" data-checked="false">')
    expect(html).toContain('<li data-type="taskItem" data-checked="true">')
    expect(html).not.toContain("<input")

    const json = toJSON("- [ ] a\n- [x] b")
    const lists = collectNodes(json, "taskList")
    expect(lists).toHaveLength(1)
    const items = collectNodes(json, "taskItem")
    expect(items.map((item) => item.attrs?.checked)).toEqual([false, true])
  })

  it("leaves a plain bullet list untouched", () => {
    const html = markdownToHtml("- one\n- two")
    expect(html).toContain("<ul>")
    expect(html).not.toContain("taskList")
    expect(toMarkdown("- one\n- two")).toBe("- one\n- two")
  })
})

describe("mixed document", () => {
  it("reaches a serialize/parse fixed point", () => {
    const input = [
      "# Title",
      "",
      "Intro paragraph",
      "",
      "- one",
      "- two",
      "",
      "Divider paragraph",
      "",
      "- [ ] task one",
      "- [x] task two",
      "",
      "[▶ Video](https://player.vimeo.com/video/123)",
      "",
      "Closing paragraph",
    ].join("\n")

    const once = toMarkdown(input)
    const twice = toMarkdown(once)
    expect(twice).toBe(once)
    expect(once).toContain("# Title")
    expect(once).toContain("- [ ] task one")
    expect(once).toContain("- [x] task two")
    expect(once).toContain("[▶ Video](https://player.vimeo.com/video/123)")
  })
})
