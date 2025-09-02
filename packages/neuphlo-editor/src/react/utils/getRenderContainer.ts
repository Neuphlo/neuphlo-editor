import { Editor } from "@tiptap/react"

export const getRenderContainer = (editor: Editor, nodeType: string) => {
  const {
    view,
    state: {
      selection: { from },
    },
  } = editor

  const elements = document.querySelectorAll(".has-focus")
  const elementCount = elements.length
  const innermostNode = elements[elementCount - 1]
  const element = innermostNode

  if (
    (element &&
      element.getAttribute("data-type") &&
      element.getAttribute("data-type") === nodeType) ||
    (element && element.classList && element.classList.contains(nodeType))
  ) {
    return element
  }

  const node = view.domAtPos(from).node
  if (node === null) {
    return null
  }
  let container = node as HTMLElement

  while (
    container &&
    !(
      container.getAttribute &&
      container.getAttribute("data-type") &&
      container.getAttribute("data-type") === nodeType
    ) &&
    !(container.classList && container.classList.contains(nodeType))
  ) {
    container = container.parentElement as HTMLElement
  }

  if (container && container instanceof HTMLElement) {
    return container
  }
  return null
}

export default getRenderContainer
