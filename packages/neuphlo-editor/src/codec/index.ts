import { Schema, type Node as ProseMirrorNode } from "@tiptap/pm/model"
import { MarkdownParser, MarkdownSerializer, defaultMarkdownSerializer } from "prosemirror-markdown"
import MarkdownIt from "markdown-it"
import type Token from "markdown-it/lib/token.mjs"
import { prosemirrorJSONToYDoc, yDocToProsemirrorJSON } from "@tiptap/y-tiptap"
import * as Y from "yjs"

export const PAGE_CODEC_VERSION = 1 as const
export const PAGE_YJS_FIELD = "body" as const

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
    paragraph: { content: "inline*", group: "block" },
    blockquote: { content: "block+", group: "block" },
    horizontalRule: { group: "block" },
    heading: { attrs: { level: { default: 1 } }, content: "inline*", group: "block" },
    codeBlock: { attrs: { language: { default: null } }, content: "text*", marks: "", group: "block", code: true },
    bulletList: { content: "listItem+", group: "block" },
    orderedList: { attrs: { start: { default: 1 }, type: { default: null } }, content: "listItem+", group: "block" },
    listItem: { content: "block+" },
    text: { group: "inline" },
    hardBreak: { inline: true, group: "inline" },
  },
  marks: {
    bold: {},
    italic: {},
    strike: {},
    code: { excludes: "_" },
    link: { attrs: { href: { default: null }, target: { default: "_blank" }, rel: { default: "noopener noreferrer nofollow" }, class: { default: null }, title: { default: null } }, inclusive: false },
  },
})

const tokenizer = new MarkdownIt({ html: true })

const parser = new MarkdownParser(pageSchema, tokenizer, {
  blockquote: { block: "blockquote" },
  paragraph: { block: "paragraph" },
  list_item: { block: "listItem" },
  bullet_list: { block: "bulletList" },
  ordered_list: { block: "orderedList", getAttrs: token => ({ start: Number(token.attrGet("start")) || 1 }) },
  heading: { block: "heading", getAttrs: token => ({ level: Number(token.tag.slice(1)) }) },
  code_block: { block: "codeBlock", noCloseToken: true },
  fence: { block: "codeBlock", noCloseToken: true, getAttrs: token => ({ language: token.info.trim() || null }) },
  hr: { node: "horizontalRule" },
  hardbreak: { node: "hardBreak" },
  em: { mark: "italic" },
  strong: { mark: "bold" },
  s: { mark: "strike" },
  link: { mark: "link", getAttrs: token => ({ href: token.attrGet("href"), title: token.attrGet("title") }) },
  code_inline: { mark: "code", noCloseToken: true },
})

const commonNodes = defaultMarkdownSerializer.nodes
const commonMarks = defaultMarkdownSerializer.marks

const serializer = new MarkdownSerializer({
  blockquote: commonNodes.blockquote,
  paragraph: commonNodes.paragraph,
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
  codeBlock: (state, node) => {
    const language = node.attrs.language || ""
    state.write(`\`\`\`${language}\n`)
    state.text(node.textContent, false)
    state.ensureNewLine()
    if (node.textContent.endsWith("\n")) state.write("\n")
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
})

const allowedTokens = new Set([
  "blockquote_open", "blockquote_close", "paragraph_open", "paragraph_close",
  "list_item_open", "list_item_close", "bullet_list_open", "bullet_list_close",
  "ordered_list_open", "ordered_list_close", "heading_open", "heading_close",
  "code_block", "fence", "hr", "hardbreak", "softbreak", "em_open", "em_close",
  "strong_open", "strong_close", "s_open", "s_close", "link_open", "link_close",
  "code_inline", "text", "inline",
])

function unsupportedToken(tokens: Token[]): string | null {
  for (const token of tokens) {
    if (!allowedTokens.has(token.type)) return token.type
    if (token.type === "inline" && /^\s*\[[ xX]\]\s/.test(token.content)) return "taskItem"
    if (token.children) {
      const nested = unsupportedToken(token.children)
      if (nested) return nested
    }
  }
  return null
}

function validDocument(doc: ProseMirrorNode): PageCodecError | null {
  if (doc.type !== pageSchema.nodes.doc) return { code: "invalid_document", detail: "document:root" }
  const acceptedAttributes: Record<string, string[]> = {
    doc: [], paragraph: [], blockquote: [], horizontalRule: [], heading: ["level"],
    codeBlock: ["language"], bulletList: [], orderedList: ["start", "type"], listItem: [],
    text: [], hardBreak: [],
  }
  const acceptedMarks: Record<string, string[]> = {
    bold: [], italic: [], strike: [], code: [], link: ["href", "target", "rel", "class", "title"],
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
    text: [], hardBreak: [],
  }
  const allowedMarks: Record<string, string[]> = {
    bold: [], italic: [], strike: [], code: [], link: ["href", "target", "rel", "class", "title"],
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
  try {
    const unsupported = unsupportedToken(tokenizer.parse(markdown, {}))
    if (unsupported) return failure("unsupported_content", `markdown:${unsupported}`)
    const doc = parser.parse(markdown)
    if (!doc) return failure("invalid_document", "markdown:empty_parse")
    const error = validDocument(doc)
    return error ? { ok: false, error } : result(doc)
  } catch (cause) {
    return failure("invalid_document", String(cause))
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
