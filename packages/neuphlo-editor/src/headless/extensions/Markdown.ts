import { Extension } from "@tiptap/core"
import { MarkdownSerializer } from "prosemirror-markdown"
import { DOMSerializer, type Node as PMNode, type Schema } from "@tiptap/pm/model"
import MarkdownIt from "markdown-it"
import type Token from "markdown-it/lib/token.mjs"

const VIDEO_LINK_LINE = /^\[▶[^\]]*\]\(([^)\s]*)\)[^\S\n]*$/gm
const TASK_MARKER = /^\[([ xX])\]\s+/

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
}

function normalizeVideoSrc(url: string): string {
  const trimmed = url.trim()
  if (trimmed === "https://" || trimmed === "http://") return ""
  return trimmed
}

function replaceVideoLinks(markdown: string): string {
  return markdown.replace(VIDEO_LINK_LINE, (_match, url: string) => {
    const src = escapeAttribute(normalizeVideoSrc(url))
    return `<div data-type="video-block" data-src="${src}" data-width="100%" data-align="center"></div>`
  })
}

function itemParagraphInline(tokens: Token[], itemOpenIdx: number): number {
  const level = tokens[itemOpenIdx].level
  for (let k = itemOpenIdx + 1; k < tokens.length; k += 1) {
    const token = tokens[k]
    if (token.type === "list_item_close" && token.level === level) return -1
    if (token.type === "inline" && token.level === level + 2) return k
  }
  return -1
}

function collectDirectItems(
  tokens: Token[],
  openIdx: number,
): { close: number; items: number[] } {
  const level = tokens[openIdx].level
  const items: number[] = []
  for (let k = openIdx + 1; k < tokens.length; k += 1) {
    const token = tokens[k]
    if (token.type === "bullet_list_close" && token.level === level) {
      return { close: k, items }
    }
    if (token.type === "list_item_open" && token.level === level + 1) {
      items.push(k)
    }
  }
  return { close: -1, items }
}

function stripTaskMarker(inline: Token): void {
  inline.content = inline.content.replace(TASK_MARKER, "")
  const child = inline.children?.[0]
  if (child && child.type === "text") {
    child.content = child.content.replace(TASK_MARKER, "")
  }
}

function taskListPlugin(md: MarkdownIt): void {
  md.core.ruler.after("inline", "neuphlo_task_list", (state) => {
    const tokens = state.tokens as Token[]
    for (let i = 0; i < tokens.length; i += 1) {
      if (tokens[i].type !== "bullet_list_open") continue
      const { items } = collectDirectItems(tokens, i)
      if (items.length === 0) continue
      const inlineIdxs = items.map((itemIdx) =>
        itemParagraphInline(tokens, itemIdx),
      )
      if (inlineIdxs.some((idx) => idx < 0)) continue
      const markers = inlineIdxs.map((idx) => TASK_MARKER.exec(tokens[idx].content))
      if (markers.some((marker) => marker === null)) continue
      tokens[i].attrSet("data-type", "taskList")
      items.forEach((itemIdx, n) => {
        const checked = markers[n]![1].toLowerCase() === "x"
        tokens[itemIdx].attrSet("data-type", "taskItem")
        tokens[itemIdx].attrSet("data-checked", checked ? "true" : "false")
        stripTaskMarker(tokens[inlineIdxs[n]])
      })
    }
  })
}

const markdownIt = new MarkdownIt({ html: true, linkify: false, breaks: false })
markdownIt.use(taskListPlugin)

export function markdownToHtml(input: string | null | undefined): string {
  if (!input) return ""
  return markdownIt.render(replaceVideoLinks(input))
}

function nodeToHtml(node: PMNode, schema: Schema): string {
  if (typeof document === "undefined") return ""
  const dom = DOMSerializer.fromSchema(schema).serializeNode(node)
  const container = document.createElement("div")
  container.appendChild(dom)
  return container.innerHTML
}

type NodeSerializer = (state: any, node: PMNode, parent: PMNode, index: number) => void

const specificNodes: Record<string, NodeSerializer> = {
  text: (state, node) => {
    state.text(node.text ?? "")
  },
  paragraph: (state, node) => {
    state.renderInline(node)
    state.closeBlock(node)
  },
  heading: (state, node) => {
    state.write(`${state.repeat("#", node.attrs.level)} `)
    state.renderInline(node)
    state.closeBlock(node)
  },
  blockquote: (state, node) => {
    state.wrapBlock("> ", null, node, () => state.renderContent(node))
  },
  horizontalRule: (state, node) => {
    state.write(node.attrs.markup || "---")
    state.closeBlock(node)
  },
  bulletList: (state, node) => {
    state.renderList(node, "  ", () => `${node.attrs.bullet || "-"} `)
  },
  orderedList: (state, node) => {
    const start = node.attrs.start || 1
    const maxWidth = String(start + node.childCount - 1).length
    const space = state.repeat(" ", maxWidth + 2)
    state.renderList(node, space, (index: number) => {
      const label = String(start + index)
      return `${state.repeat(" ", maxWidth - label.length)}${label}. `
    })
  },
  listItem: (state, node) => {
    state.renderContent(node)
  },
  taskList: (state, node) => {
    state.renderList(node, "    ", (index: number) =>
      node.child(index).attrs.checked ? "- [x] " : "- [ ] ",
    )
  },
  taskItem: (state, node) => {
    state.renderContent(node)
  },
  videoBlock: (state, node) => {
    const src = String(node.attrs.src ?? "").trim()
    state.write(`[▶ Video](${src || "https://"})`)
    state.closeBlock(node)
  },
  codeBlock: (state, node) => {
    state.write(`\`\`\`${node.attrs.language || ""}\n`)
    state.text(node.textContent, false)
    state.ensureNewLine()
    state.write("```")
    state.closeBlock(node)
  },
  hardBreak: (state, node, parent, index) => {
    for (let i = index + 1; i < parent.childCount; i += 1) {
      if (parent.child(i).type !== node.type) {
        state.write("\\\n")
        return
      }
    }
  },
}

const inlineHtmlNodes = new Set(["mention", "reference"])

type MarkSerializer = {
  open: string | ((state: any, mark: any, parent: PMNode, index: number) => string)
  close: string | ((state: any, mark: any, parent: PMNode, index: number) => string)
  mixable?: boolean
  expelEnclosingWhitespace?: boolean
  escape?: boolean
}

const specificMarks: Record<string, MarkSerializer> = {
  bold: { open: "**", close: "**", mixable: true, expelEnclosingWhitespace: true },
  italic: { open: "*", close: "*", mixable: true, expelEnclosingWhitespace: true },
  strike: { open: "~~", close: "~~", mixable: true, expelEnclosingWhitespace: true },
  underline: { open: "<u>", close: "</u>", mixable: true },
  code: { open: "`", close: "`", escape: false },
  link: {
    open: "[",
    close: (_state, mark) => {
      const href = mark.attrs.href || ""
      const title = mark.attrs.title ? ` "${mark.attrs.title}"` : ""
      return `](${href}${title})`
    },
  },
}

function buildSerializer(schema: Schema): MarkdownSerializer {
  const nodes: Record<string, NodeSerializer> = {}
  for (const name of Object.keys(schema.nodes)) {
    if (specificNodes[name]) {
      nodes[name] = specificNodes[name]
      continue
    }
    const type = schema.nodes[name]
    if (type.isText) {
      nodes[name] = specificNodes.text
      continue
    }
    if (type.isInline || inlineHtmlNodes.has(name)) {
      nodes[name] = (state, node) => {
        state.text(nodeToHtml(node, schema), false)
      }
      continue
    }
    nodes[name] = (state, node) => {
      state.write(nodeToHtml(node, schema))
      state.closeBlock(node)
    }
  }

  const marks: Record<string, MarkSerializer> = {}
  for (const name of Object.keys(schema.marks)) {
    marks[name] = specificMarks[name] || { open: "", close: "", mixable: true }
  }

  return new MarkdownSerializer(nodes as any, marks as any)
}

export interface MarkdownStorage {
  serializer: MarkdownSerializer | null
  getMarkdown: () => string
}

export const Markdown = Extension.create({
  name: "markdown",

  addStorage(): MarkdownStorage {
    return {
      serializer: null,
      getMarkdown: () => "",
    }
  },

  onBeforeCreate() {
    const storage = this.storage as MarkdownStorage
    storage.serializer = buildSerializer(this.editor.schema)
    storage.getMarkdown = () => {
      try {
        return storage.serializer!.serialize(this.editor.state.doc, {
          tightLists: true,
        })
      } catch {
        return this.editor.getHTML()
      }
    }
  },
})

export default Markdown
