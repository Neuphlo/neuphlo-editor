import BaseDragHandle from "@tiptap/extension-drag-handle"
import type { Node } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/core"

export interface DragHandleCallbacks {
  onAddBlock?: (editor: Editor, node: Node | null) => void
  onGripClick?: (editor: Editor, node: Node | null, element: HTMLElement) => void
}

let currentCallbacks: DragHandleCallbacks = {}
let currentNode: Node | null = null
let currentEditor: Editor | null = null

export function setDragHandleCallbacks(callbacks: DragHandleCallbacks) {
  currentCallbacks = callbacks
}

function createDragHandleElement(): HTMLElement {
  const container = document.createElement("div")
  container.className = "nph-drag-handle"

  const plusBtn = document.createElement("button")
  plusBtn.className = "nph-drag-handle__btn"
  plusBtn.type = "button"
  plusBtn.setAttribute("aria-label", "Add block")
  plusBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`
  plusBtn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentEditor) {
      currentCallbacks.onAddBlock?.(currentEditor, currentNode)
    }
  })

  const gripBtn = document.createElement("button")
  gripBtn.className = "nph-drag-handle__btn nph-drag-handle__grip"
  gripBtn.type = "button"
  gripBtn.setAttribute("aria-label", "Drag to reorder")
  gripBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`
  gripBtn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentEditor) {
      currentCallbacks.onGripClick?.(currentEditor, currentNode, container)
    }
  })

  container.appendChild(plusBtn)
  container.appendChild(gripBtn)

  return container
}

export const DragHandle = BaseDragHandle.configure({
  render: createDragHandleElement,
  nested: true,
  onNodeChange: ({ node, editor }) => {
    currentNode = node
    currentEditor = editor
  },
})

export default DragHandle
