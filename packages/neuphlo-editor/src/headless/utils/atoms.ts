import { atom } from "jotai"
import type { Range } from "@tiptap/core"

export const queryAtom = atom("")
export const rangeAtom = atom<Range | null>(null)
export const slashMenuOpenAtom = atom(false)
export const slashMenuRectAtom = atom<DOMRect | null>(null)
