import { DOMParser, DOMSerializer, Schema, type Node as ProseMirrorNode } from "@tiptap/pm/model"
import { MarkdownSerializer, defaultMarkdownSerializer } from "prosemirror-markdown"
import { Window } from "happy-dom"
import { prosemirrorJSONToYDoc, yDocToProsemirrorJSON } from "@tiptap/y-tiptap"
import * as Y from "yjs"
import { markdownToHtml } from "../headless/extensions/Markdown"

export const PAGE_CODEC_VERSION = 1 as const
export const PAGE_YJS_FIELD = "body" as const
export const PAGE_MAX_MARKDOWN_LENGTH = 500_000
export const PAGE_MAX_STATE_BYTES = 4 * 1024 * 1024

export type PageCodecError = {
  code: "unsupported_content" | "invalid_document" | "unsupported_version"
  detail: string
}

export type PageCodecResult<T> =
  | { ok: true; value: T; version: typeof PAGE_CODEC_VERSION }
  | { ok: false; error: PageCodecError }

export const pageSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: { content: "inline*", group: "block", parseDOM: [{ tag: "p" }], toDOM: () => ["p", 0] },
    blockquote: { content: "block+", group: "block", parseDOM: [{ tag: "blockquote" }], toDOM: () => ["blockquote", 0] },
    horizontalRule: { group: "block", parseDOM: [{ tag: "hr" }], toDOM: () => ["hr"] },
    heading: {
      attrs: { level: { default: 1 } }, content: "inline*", group: "block",
      parseDOM: [1, 2, 3, 4, 5, 6].map(level => ({ tag: `h${level}`, attrs: { level } })),
      toDOM: node => [`h${node.attrs.level}`, 0],
    },
    codeBlock: {
      attrs: { language: { default: null } }, content: "text*", marks: "", group: "block", code: true,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full", getAttrs: element => ({ language: element.querySelector("code")?.className.replace(/^language-/, "") || null }) }],
      toDOM: node => ["pre", ["code", node.attrs.language ? { class: `language-${node.attrs.language}` } : {}, 0]],
    },
    bulletList: { content: "listItem+", group: "block", parseDOM: [{ tag: "ul:not([data-type='taskList'])" }], toDOM: () => ["ul", 0] },
    orderedList: {
      attrs: { start: { default: 1 }, type: { default: null } }, content: "listItem+", group: "block",
      parseDOM: [{ tag: "ol", getAttrs: element => ({ start: Number(element.getAttribute("start")) || 1 }) }],
      toDOM: node => ["ol", node.attrs.start === 1 ? {} : { start: node.attrs.start }, 0],
    },
    listItem: { content: "block+", parseDOM: [{ tag: "li:not([data-type='taskItem'])" }], toDOM: () => ["li", 0] },
    taskList: { content: "taskItem+", group: "block", parseDOM: [{ tag: "ul[data-type='taskList']" }], toDOM: () => ["ul", { "data-type": "taskList" }, 0] },
    taskItem: {
      attrs: { checked: { default: false } }, content: "block+",
      parseDOM: [{ tag: "li[data-type='taskItem']", getAttrs: element => ({ checked: element.getAttribute("data-checked") === "true" }) }],
      toDOM: node => ["li", { "data-type": "taskItem", "data-checked": String(node.attrs.checked) }, 0],
    },
    table: { content: "tableRow+", group: "block", isolating: true, parseDOM: [{ tag: "table" }], toDOM: () => ["table", ["tbody", 0]] },
    tableRow: { content: "(tableCell | tableHeader)+", parseDOM: [{ tag: "tr" }], toDOM: () => ["tr", 0] },
    tableCell: {
      attrs: { colspan: { default: 1 }, rowspan: { default: 1 }, colwidth: { default: null } }, content: "block+", isolating: true,
      parseDOM: [{ tag: "td", getAttrs: element => ({ colspan: Number(element.getAttribute("colspan")) || 1, rowspan: Number(element.getAttribute("rowspan")) || 1, colwidth: (element.getAttribute("colwidth") ?? element.getAttribute("data-colwidth"))?.split(",").map(Number) ?? null }) }],
      toDOM: node => ["td", { colspan: node.attrs.colspan, rowspan: node.attrs.rowspan, ...(node.attrs.colwidth ? { colwidth: node.attrs.colwidth.join(",") } : {}) }, 0],
    },
    tableHeader: {
      attrs: { colspan: { default: 1 }, rowspan: { default: 1 }, colwidth: { default: null } }, content: "block+", isolating: true,
      parseDOM: [{ tag: "th", getAttrs: element => ({ colspan: Number(element.getAttribute("colspan")) || 1, rowspan: Number(element.getAttribute("rowspan")) || 1, colwidth: (element.getAttribute("colwidth") ?? element.getAttribute("data-colwidth"))?.split(",").map(Number) ?? null }) }],
      toDOM: node => ["th", { colspan: node.attrs.colspan, rowspan: node.attrs.rowspan, ...(node.attrs.colwidth ? { colwidth: node.attrs.colwidth.join(",") } : {}) }, 0],
    },
    imageBlock: {
      attrs: { src: { default: "" }, width: { default: "100%" }, align: { default: "center" }, alt: { default: undefined }, loading: { default: false } },
      group: "block", atom: true, isolating: true,
      parseDOM: [{ tag: "img[src]", getAttrs: element => ({ src: element.getAttribute("src") || "", width: element.getAttribute("data-width") || "100%", align: element.getAttribute("data-align") || "center", alt: element.getAttribute("alt") ?? undefined, loading: false }) }],
      toDOM: node => ["img", { src: node.attrs.src, "data-width": node.attrs.width, "data-align": node.attrs.align, ...(node.attrs.alt === undefined ? {} : { alt: node.attrs.alt }) }],
    },
    videoBlock: {
      attrs: { src: { default: "" }, width: { default: "100%" }, align: { default: "center" } },
      group: "block", atom: true, isolating: true,
      parseDOM: [{ tag: "div[data-type='video-block']", getAttrs: element => ({ src: element.getAttribute("data-src") || "", width: element.getAttribute("data-width") || "100%", align: element.getAttribute("data-align") || "center" }) }],
      toDOM: node => ["div", { "data-type": "video-block", "data-src": node.attrs.src, "data-width": node.attrs.width, "data-align": node.attrs.align }],
    },
    text: { group: "inline" },
    hardBreak: { inline: true, group: "inline", parseDOM: [{ tag: "br" }], toDOM: () => ["br"] },
  },
  marks: {
    bold: { parseDOM: [{ tag: "strong" }, { tag: "b" }], toDOM: () => ["strong", 0] },
    italic: { parseDOM: [{ tag: "em" }, { tag: "i" }], toDOM: () => ["em", 0] },
    strike: { parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }], toDOM: () => ["s", 0] },
    underline: { parseDOM: [{ tag: "u" }], toDOM: () => ["u", 0] },
    code: { excludes: "_", parseDOM: [{ tag: "code" }], toDOM: () => ["code", 0] },
    link: {
      attrs: { href: { default: null }, target: { default: "_blank" }, rel: { default: "noopener noreferrer nofollow" }, class: { default: null }, title: { default: null } }, inclusive: false,
      parseDOM: [{ tag: "a[href]", getAttrs: element => ({ href: element.getAttribute("href"), title: element.getAttribute("title") }) }],
      toDOM: mark => ["a", { href: mark.attrs.href, target: mark.attrs.target, rel: mark.attrs.rel, ...(mark.attrs.title ? { title: mark.attrs.title } : {}) }, 0],
    },
  },
})

function createCodecWindow() {
  return new Window({
    url: "https://codec.neuphlo.invalid/",
    settings: {
      enableJavaScriptEvaluation: false,
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
    },
  })
}

const allowedHtmlAttributes: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"], b: [], blockquote: [], br: [], code: ["class"],
  col: ["style"], colgroup: [], del: [], div: ["data-type", "data-src", "data-width", "data-align"],
  em: [], h1: [], h2: [], h3: [], h4: [], h5: [], h6: [], hr: [], i: [],
  img: ["src", "alt", "data-width", "data-align"], li: ["data-type", "data-checked"],
  ol: ["start"], p: [], pre: [], s: [], span: [], strike: [], strong: [],
  table: ["style"], tbody: [], td: ["colspan", "rowspan", "colwidth", "data-colwidth"],
  th: ["colspan", "rowspan", "colwidth", "data-colwidth"], thead: [], tr: [], u: [], ul: ["data-type"],
}

function invalidHtml(element: Element): string | null {
  const name = element.tagName.toLowerCase()
  const allowed = allowedHtmlAttributes[name]
  if (!allowed) return `html:${name}`
  if (Array.from(element.attributes).some(attribute => !allowed.includes(attribute.name.toLowerCase()))) return `html:${name}:attribute`
  if (name === "div" && element.getAttribute("data-type") !== "video-block") return "html:div"
  if (name === "ul" && element.hasAttribute("data-type") && element.getAttribute("data-type") !== "taskList") return "html:ul"
  if (name === "li" && element.hasAttribute("data-type") && element.getAttribute("data-type") !== "taskItem") return "html:li"
  if (name === "li" && element.hasAttribute("data-checked") && (element.getAttribute("data-type") !== "taskItem" || !["true", "false"].includes(element.getAttribute("data-checked") ?? ""))) return "html:li:checked"
  if (name === "a" && ((element.hasAttribute("target") && element.getAttribute("target") !== "_blank") || (element.hasAttribute("rel") && element.getAttribute("rel") !== "noopener noreferrer nofollow"))) return "html:a:attributes"
  if (name === "code" && element.hasAttribute("class") && (element.parentElement?.tagName.toLowerCase() !== "pre" || !/^language-[a-z0-9_+.-]+$/i.test(element.getAttribute("class") ?? ""))) return "html:code:class"
  if (name === "ol" && element.hasAttribute("start") && (!Number.isInteger(Number(element.getAttribute("start"))) || Number(element.getAttribute("start")) < 1)) return "html:ol:start"
  if ((name === "td" || name === "th") && ["colspan", "rowspan"].some(attribute => element.hasAttribute(attribute) && (!Number.isInteger(Number(element.getAttribute(attribute))) || Number(element.getAttribute(attribute)) < 1))) return `html:${name}:span`
  if ((name === "td" || name === "th") && ["colwidth", "data-colwidth"].some(attribute => element.hasAttribute(attribute) && !(element.getAttribute(attribute) ?? "").split(",").every(width => Number.isInteger(Number(width)) && Number(width) > 0))) return `html:${name}:width`
  if ((name === "table" || name === "col") && element.hasAttribute("style") && !/^\s*(?:min-)?width:\s*\d+px;?\s*$/.test(element.getAttribute("style") ?? "")) return `html:${name}:style`
  for (const child of Array.from(element.children)) {
    const invalid = invalidHtml(child)
    if (invalid) return invalid
  }
  return null
}

function nodeToHtml(node: ProseMirrorNode): string {
  const window = createCodecWindow()
  try {
    const container = window.document.createElement("div")
    const fragment = DOMSerializer.fromSchema(pageSchema).serializeNode(node, { document: window.document as unknown as Document })
    container.appendChild(fragment as unknown as Parameters<typeof container.appendChild>[0])
    return container.innerHTML
  } finally {
    window.close()
  }
}

const commonNodes = defaultMarkdownSerializer.nodes
const commonMarks = defaultMarkdownSerializer.marks

const serializer = new MarkdownSerializer({
  blockquote: commonNodes.blockquote,
  paragraph: (state, node) => {
    if (node.childCount === 0) state.write("<p></p>")
    else state.renderInline(node)
    state.closeBlock(node)
  },
  heading: commonNodes.heading,
  text: commonNodes.text,
  horizontalRule: commonNodes.horizontal_rule,
  bulletList: commonNodes.bullet_list,
  orderedList: (state, node) => {
    const start = node.attrs.start
    const maxWidth = String(start + node.childCount - 1).length
    const space = state.repeat(" ", maxWidth + 2)
    state.renderList(node, space, index => {
      const label = String(start + index)
      return `${state.repeat(" ", maxWidth - label.length)}${label}. `
    })
  },
  listItem: commonNodes.list_item,
  taskList: (state, node) => state.renderList(node, "    ", index => node.child(index).attrs.checked ? "- [x] " : "- [ ] "),
  taskItem: commonNodes.list_item,
  table: (state, node) => { state.write(nodeToHtml(node)); state.closeBlock(node) },
  tableRow: (state, node) => { state.write(nodeToHtml(node)); state.closeBlock(node) },
  tableCell: (state, node) => { state.write(nodeToHtml(node)); state.closeBlock(node) },
  tableHeader: (state, node) => { state.write(nodeToHtml(node)); state.closeBlock(node) },
  imageBlock: (state, node) => { state.write(nodeToHtml(node)); state.closeBlock(node) },
  videoBlock: (state, node) => { state.write(nodeToHtml(node)); state.closeBlock(node) },
  codeBlock: (state, node) => {
    const language = node.attrs.language || ""
    state.write(`\`\`\`${language}\n`)
    state.text(node.textContent, false)
    state.ensureNewLine()
    state.write("```")
    state.closeBlock(node)
  },
  hardBreak: commonNodes.hard_break,
}, {
  bold: commonMarks.strong,
  italic: commonMarks.em,
  code: commonMarks.code,
  link: commonMarks.link,
  strike: { open: "~~", close: "~~", mixable: true, expelEnclosingWhitespace: true },
  underline: { open: "<u>", close: "</u>", mixable: true },
})

function validDocument(doc: ProseMirrorNode): PageCodecError | null {
  if (doc.type !== pageSchema.nodes.doc) return { code: "invalid_document", detail: "document:root" }
  const acceptedAttributes: Record<string, string[]> = {
    doc: [], paragraph: [], blockquote: [], horizontalRule: [], heading: ["level"],
    codeBlock: ["language"], bulletList: [], orderedList: ["start", "type"], listItem: [],
    taskList: [], taskItem: ["checked"], table: [], tableRow: [],
    tableCell: ["colspan", "rowspan", "colwidth"], tableHeader: ["colspan", "rowspan", "colwidth"],
    imageBlock: ["src", "width", "align", "alt", "loading"], videoBlock: ["src", "width", "align"],
    text: [], hardBreak: [],
  }
  const acceptedMarks: Record<string, string[]> = {
    bold: [], italic: [], strike: [], underline: [], code: [], link: ["href", "target", "rel", "class", "title"],
  }
  let error: PageCodecError | null = null
  doc.descendants((node) => {
    if (error) return false
    const attrs = acceptedAttributes[node.type.name]
    if (!attrs || Object.keys(node.attrs).some(key => !attrs.includes(key))) {
      error = { code: "unsupported_content", detail: `node:${node.type.name}` }
      return false
    }
    if (node.type.name === "heading" && (!Number.isInteger(node.attrs.level) || node.attrs.level < 1 || node.attrs.level > 6)) {
      error = { code: "unsupported_content", detail: "heading:level" }
      return false
    }
    if (node.type.name === "orderedList" && (node.attrs.type !== null || !Number.isInteger(node.attrs.start) || node.attrs.start < 1)) {
      error = { code: "unsupported_content", detail: "orderedList:attrs" }
      return false
    }
    if (node.type.name === "codeBlock" && (node.attrs.language !== null && (typeof node.attrs.language !== "string" || /[\r\n`]/.test(node.attrs.language)))) {
      error = { code: "unsupported_content", detail: "codeBlock:language" }
      return false
    }
    if (node.type.name === "taskItem" && typeof node.attrs.checked !== "boolean") {
      error = { code: "unsupported_content", detail: "taskItem:checked" }
      return false
    }
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      const widths = node.attrs.colwidth
      if (!Number.isInteger(node.attrs.colspan) || node.attrs.colspan < 1 || !Number.isInteger(node.attrs.rowspan) || node.attrs.rowspan < 1 || (widths !== null && (!Array.isArray(widths) || widths.length !== node.attrs.colspan || widths.some((width: unknown) => !Number.isInteger(width) || Number(width) < 1)))) {
        error = { code: "unsupported_content", detail: `${node.type.name}:dimensions` }
        return false
      }
    }
    if (node.type.name === "imageBlock" || node.type.name === "videoBlock") {
      const source = node.attrs.src
      if (typeof source !== "string" || (source && !/^(https?:\/\/|\/api\/files\/[0-9a-f-]{36}(?:\?.*)?$)/i.test(source)) || (node.type.name === "imageBlock" && (!source || node.attrs.loading !== false || (node.attrs.alt !== undefined && typeof node.attrs.alt !== "string"))) || typeof node.attrs.width !== "string" || !/^\d+(?:\.\d+)?%$/.test(node.attrs.width) || !["left", "center", "right"].includes(node.attrs.align)) {
        error = { code: "unsupported_content", detail: `${node.type.name}:attributes` }
        return false
      }
    }
    for (const mark of node.marks) {
      const markAttrs = acceptedMarks[mark.type.name]
      if (!markAttrs || Object.keys(mark.attrs).some(key => !markAttrs.includes(key))) {
        error = { code: "unsupported_content", detail: `mark:${mark.type.name}` }
        return false
      }
      if (mark.type.name === "link") {
        const href = mark.attrs.href
        const title = mark.attrs.title
        if (typeof href !== "string" || !/^(https?:\/\/|mailto:|\/|#)/i.test(href) || (title !== null && typeof title !== "string")) {
          error = { code: "unsupported_content", detail: "link:href" }
          return false
        }
        if (mark.attrs.target !== "_blank" || mark.attrs.rel !== "noopener noreferrer nofollow" || mark.attrs.class !== null) {
          error = { code: "unsupported_content", detail: "link:display_attrs" }
          return false
        }
      }
    }
    return true
  })
  return error
}

function unsupportedJSON(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "document:shape"
  const node = value as Record<string, unknown>
  if (typeof node.type !== "string" || !pageSchema.nodes[node.type]) return `node:${String(node.type)}`
  if (node.type === "text" && (typeof node.text !== "string" || node.content !== undefined || node.attrs !== undefined)) return "node:text:shape"
  if (node.type !== "text" && node.text !== undefined) return `node:${node.type}:text`
  if (["hardBreak", "horizontalRule"].includes(node.type) && node.content !== undefined) return `node:${node.type}:content`
  if (!["text", "hardBreak"].includes(node.type) && node.marks !== undefined) return `node:${node.type}:marks`
  const allowedAttributes: Record<string, string[]> = {
    doc: [], paragraph: [], blockquote: [], horizontalRule: [], heading: ["level"],
    codeBlock: ["language"], bulletList: [], orderedList: ["start", "type"], listItem: [],
    taskList: [], taskItem: ["checked"], table: [], tableRow: [],
    tableCell: ["colspan", "rowspan", "colwidth"], tableHeader: ["colspan", "rowspan", "colwidth"],
    imageBlock: ["src", "width", "align", "alt", "loading"], videoBlock: ["src", "width", "align"],
    text: [], hardBreak: [],
  }
  const allowedMarks: Record<string, string[]> = {
    bold: [], italic: [], strike: [], underline: [], code: [], link: ["href", "target", "rel", "class", "title"],
  }
  if (Object.keys(node).some(key => !["type", "attrs", "content", "marks", "text"].includes(key))) return `node:${node.type}:fields`
  if (node.attrs && (typeof node.attrs !== "object" || Array.isArray(node.attrs) || Object.keys(node.attrs).some(key => !allowedAttributes[node.type as string].includes(key)))) return `node:${node.type}:attrs`
  if (node.marks) {
    if (!Array.isArray(node.marks)) return "marks:shape"
    for (const mark of node.marks) {
      if (!mark || typeof mark !== "object" || Array.isArray(mark)) return "mark:shape"
      const rawMark = mark as Record<string, unknown>
      if (typeof rawMark.type !== "string" || !allowedMarks[rawMark.type]) return `mark:${String(rawMark.type)}`
      if (Object.keys(rawMark).some(key => !["type", "attrs"].includes(key))) return `mark:${rawMark.type}:fields`
      if (rawMark.attrs && (typeof rawMark.attrs !== "object" || Array.isArray(rawMark.attrs) || Object.keys(rawMark.attrs).some(key => !allowedMarks[rawMark.type as string].includes(key)))) return `mark:${rawMark.type}:attrs`
    }
  }
  if (node.content) {
    if (!Array.isArray(node.content)) return `node:${node.type}:content`
    for (const child of node.content) {
      const unsupported = unsupportedJSON(child)
      if (unsupported) return unsupported
    }
  }
  return null
}

function result<T>(value: T): PageCodecResult<T> {
  return { ok: true, value, version: PAGE_CODEC_VERSION }
}

function failure(code: PageCodecError["code"], detail: string): PageCodecResult<never> {
  return { ok: false, error: { code, detail } }
}

export function parsePageMarkdown(markdown: string): PageCodecResult<ProseMirrorNode> {
  if (markdown.length > PAGE_MAX_MARKDOWN_LENGTH) return failure("invalid_document", "markdown:too_large")
  const window = createCodecWindow()
  try {
    window.document.body.innerHTML = markdownToHtml(markdown)
    for (const child of Array.from(window.document.body.children)) {
      const unsupported = invalidHtml(child as unknown as Element)
      if (unsupported) return failure("unsupported_content", unsupported)
    }
    const doc = DOMParser.fromSchema(pageSchema).parse(window.document.body as unknown as HTMLElement)
    const error = validDocument(doc)
    return error ? { ok: false, error } : result(doc)
  } catch (cause) {
    return failure("invalid_document", String(cause))
  } finally {
    window.close()
  }
}

export function parsePageJSON(json: unknown, version: number): PageCodecResult<ProseMirrorNode> {
  if (version !== PAGE_CODEC_VERSION) return failure("unsupported_version", String(version))
  const unsupported = unsupportedJSON(json)
  if (unsupported) return failure("unsupported_content", unsupported)
  try {
    const doc = pageSchema.nodeFromJSON(json)
    doc.check()
    const error = validDocument(doc)
    return error ? { ok: false, error } : result(doc)
  } catch (cause) {
    return failure("invalid_document", String(cause))
  }
}

export function serializePageMarkdown(json: unknown, version: number): PageCodecResult<string> {
  const parsed = parsePageJSON(json, version)
  if (!parsed.ok) return parsed
  try {
    const markdown = serializer.serialize(parsed.value, { tightLists: true }).trimEnd()
    const roundTrip = parsePageMarkdown(markdown)
    if (!roundTrip.ok) return roundTrip
    if (JSON.stringify(roundTrip.value.toJSON()) !== JSON.stringify(parsed.value.toJSON())) {
      return failure("unsupported_content", "markdown:non_round_trippable")
    }
    return result(markdown)
  } catch (cause) {
    return failure("invalid_document", String(cause))
  }
}

export function pageJSONToYDoc(json: unknown, version: number): PageCodecResult<Y.Doc> {
  const parsed = parsePageJSON(json, version)
  if (!parsed.ok) return parsed
  try {
    return result(prosemirrorJSONToYDoc(pageSchema, parsed.value.toJSON(), PAGE_YJS_FIELD))
  } catch (cause) {
    return failure("invalid_document", String(cause))
  }
}

export function pageYDocToJSON(doc: Y.Doc, version: number): PageCodecResult<ReturnType<ProseMirrorNode["toJSON"]>> {
  if (version !== PAGE_CODEC_VERSION) return failure("unsupported_version", String(version))
  try {
    const parsed = parsePageJSON(yDocToProsemirrorJSON(doc, PAGE_YJS_FIELD), version)
    return parsed.ok ? result(parsed.value.toJSON()) : parsed
  } catch (cause) {
    return failure("invalid_document", String(cause))
  }
}

export function markdownToPageYjsState(markdown: string): PageCodecResult<Uint8Array> {
  const parsed = parsePageMarkdown(markdown)
  if (!parsed.ok) return parsed
  const encoded = pageJSONToYDoc(parsed.value.toJSON(), PAGE_CODEC_VERSION)
  if (!encoded.ok) return encoded
  try {
    const bytes = Y.encodeStateAsUpdate(encoded.value)
    if (bytes.byteLength > PAGE_MAX_STATE_BYTES) return failure("invalid_document", "yjs:too_large")
    const projected = pageYjsStateToMarkdown(bytes, PAGE_CODEC_VERSION)
    if (!projected.ok) return projected
    const restored = parsePageMarkdown(projected.value)
    if (!restored.ok || JSON.stringify(restored.value.toJSON()) !== JSON.stringify(parsed.value.toJSON())) return failure("unsupported_content", "markdown:non_round_trippable")
    return result(bytes)
  } finally {
    encoded.value.destroy()
  }
}

export function pageYjsStateToMarkdown(bytes: Uint8Array, version: number): PageCodecResult<string> {
  if (version !== PAGE_CODEC_VERSION) return failure("unsupported_version", String(version))
  if (bytes.byteLength > PAGE_MAX_STATE_BYTES) return failure("invalid_document", "yjs:too_large")
  const doc = new Y.Doc()
  try {
    Y.applyUpdate(doc, bytes)
    const decoded = pageYDocToJSON(doc, version)
    return decoded.ok ? serializePageMarkdown(decoded.value, version) : decoded
  } catch (cause) {
    return failure("invalid_document", String(cause))
  } finally {
    doc.destroy()
  }
}
