import { expect, it } from "vitest"
import { Doc } from "yjs"
import { ExtensionKit } from "./extension-kit"

it("lets collaboration own undo and redo without changing the ordinary editor", () => {
  const ordinary = ExtensionKit({ slashCommand: false, dragHandle: false })
  const doc = new Doc()
  const collaborative = ExtensionKit({
    collaboration: { doc, field: "body" },
    slashCommand: false,
    dragHandle: false,
  })
  const ordinaryStarter = ordinary.find((extension) => extension.name === "starterKit")
  const collaborativeStarter = collaborative.find((extension) => extension.name === "starterKit")
  expect(ordinaryStarter?.options.undoRedo).toBeUndefined()
  expect(collaborativeStarter?.options.undoRedo).toBe(false)
  doc.destroy()
})
