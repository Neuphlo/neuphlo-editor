import { Extension } from "@tiptap/core"
import { MarkdownSerializer } from "prosemirror-markdown"
import { DOMSerializer, type Node as PMNode, type Schema } from "@tiptap/pm/model"
import MarkdownIt from "markdown-it"

const markdownIt = new MarkdownIt({ html: true, linkify: false, breaks: false })

export function markdownToHtml(input: string | null | undefined): string {
  if (!input) return ""
  return markdownIt.render(input)
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
