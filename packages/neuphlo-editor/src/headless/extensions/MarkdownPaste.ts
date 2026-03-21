import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { MarkdownParser, defaultMarkdownParser } from "@tiptap/pm/markdown"

const markdownPastePluginKey = new PluginKey("markdownPaste")

/**
 * Heuristic: does the plain text look like it contains markdown syntax?
 */
function looksLikeMarkdown(text: string): boolean {
  const patterns = [
    /^#{1,6}\s/m,              // headings
    /^\s*[-*+]\s/m,            // unordered list
    /^\s*\d+\.\s/m,            // ordered list
    /^\s*>\s/m,                // blockquote
    /\|.+\|/m,                 // table
    /^```/m,                   // fenced code block
    /\*\*.+\*\*/,              // bold
    /\*.+\*/,                  // italic
    /~~.+~~/,                  // strikethrough
    /`[^`]+`/,                 // inline code
    /^\s*---\s*$/m,            // horizontal rule
    /^\s*\*\*\*\s*$/m,         // horizontal rule alt
    /\[.+\]\(.+\)/,           // links
    /!\[.*\]\(.+\)/,          // images
  ]
  // Need at least one markdown pattern match and it shouldn't be HTML
  const hasMarkdown = patterns.some((p) => p.test(text))
  const isHtml = /^<[a-z][\s\S]*>/i.test(text.trim())
  return hasMarkdown && !isHtml
}

/**
 * Build a MarkdownParser configured for TipTap's schema node/mark names.
 * Re-uses the markdown-it tokenizer from prosemirror-markdown's default parser.
 */
function buildParser(schema: any): MarkdownParser | null {
  // Grab the markdown-it tokenizer instance from prosemirror-markdown's default parser
  const md = defaultMarkdownParser.tokenizer

  const tokens: Record<string, any> = {}

  // Block nodes
  if (schema.nodes.paragraph) tokens.paragraph = { block: "paragraph" }
  if (schema.nodes.heading) {
    tokens.heading = {
      block: "heading",
      getAttrs: (tok: any) => ({ level: Number(tok.tag.slice(1)) }),
    }
  }
  if (schema.nodes.blockquote) tokens.blockquote = { block: "blockquote" }
  if (schema.nodes.bulletList) tokens.bullet_list = { block: "bulletList" }
  if (schema.nodes.orderedList) {
    tokens.ordered_list = {
      block: "orderedList",
      getAttrs: (tok: any) => ({ start: Number(tok.attrGet("start") || 1) }),
    }
  }
  if (schema.nodes.listItem) tokens.list_item = { block: "listItem" }
  if (schema.nodes.codeBlock) {
    tokens.code_block = { block: "codeBlock", noCloseToken: true }
    tokens.fence = {
      block: "codeBlock",
      getAttrs: (tok: any) => ({ language: tok.info || "" }),
      noCloseToken: true,
    }
  }
  if (schema.nodes.horizontalRule) {
    tokens.hr = { node: "horizontalRule" }
  }
  if (schema.nodes.hardBreak) {
    tokens.hardbreak = { node: "hardBreak" }
  }
  if (schema.nodes.image) {
    tokens.image = {
      node: "image",
      getAttrs: (tok: any) => ({
        src: tok.attrGet("src"),
        title: tok.attrGet("title") || null,
        alt: tok.children?.[0]?.content || null,
      }),
    }
  }

  // Table support — markdown-it needs the table plugin enabled
  if (schema.nodes.table) {
    tokens.table = { block: "table" }
    tokens.thead = { ignore: true }
    tokens.tbody = { ignore: true }
    tokens.tr = { block: "tableRow" }
    tokens.th = { block: "tableHeader" }
    tokens.td = { block: "tableCell" }
  }

  // Marks
  if (schema.marks.bold || schema.marks.strong) {
    tokens.strong = { mark: schema.marks.bold ? "bold" : "strong" }
  }
  if (schema.marks.italic || schema.marks.em) {
    tokens.em = { mark: schema.marks.italic ? "italic" : "em" }
  }
  if (schema.marks.code) {
    tokens.code_inline = { mark: "code", noCloseToken: true }
  }
  if (schema.marks.link) {
    tokens.link = {
      mark: "link",
      getAttrs: (tok: any) => ({
        href: tok.attrGet("href"),
        title: tok.attrGet("title") || null,
      }),
    }
  }
  if (schema.marks.strike || schema.marks.strikethrough) {
    tokens.s = { mark: schema.marks.strike ? "strike" : "strikethrough" }
  }

  try {
    return new MarkdownParser(schema, md, tokens)
  } catch {
    return null
  }
}

export const MarkdownPaste = Extension.create({
  name: "markdownPaste",

  addProseMirrorPlugins() {
    const schema = this.editor.schema
    let parser: MarkdownParser | null = null

    return [
      new Plugin({
        key: markdownPastePluginKey,
        props: {
          handlePaste(view, event) {
            const clipboardData = event.clipboardData
            if (!clipboardData) return false

            // If there's HTML content, let ProseMirror handle it normally
            // (the browser/OS already converted rich content)
            const html = clipboardData.getData("text/html")
            if (html && html.trim().length > 0) return false

            const text = clipboardData.getData("text/plain")
            if (!text || !looksLikeMarkdown(text)) return false

            // Lazily build parser on first use
            if (!parser) {
              parser = buildParser(schema)
            }
            if (!parser) return false

            try {
              const doc = parser.parse(text)
              if (!doc || doc.content.size === 0) return false

              const { tr } = view.state
              const slice = doc.slice(0, doc.content.size)
              tr.replaceSelection(slice)
              view.dispatch(tr)
              return true
            } catch {
              // Fall back to default paste behavior
              return false
            }
          },
        },
      }),
    ]
  },
})

export default MarkdownPaste
