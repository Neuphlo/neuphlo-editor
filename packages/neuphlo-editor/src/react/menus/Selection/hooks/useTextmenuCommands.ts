import { Editor } from "@tiptap/react"
import { useCallback } from "react"

export const useTextmenuCommands = (editor: Editor) => {
  const onBold = useCallback(
    () => editor.chain().focus().toggleBold().run(),
    [editor]
  )
  const onItalic = useCallback(
    () => editor.chain().focus().toggleItalic().run(),
    [editor]
  )
  const onStrike = useCallback(
    () => editor.chain().focus().toggleStrike().run(),
    [editor]
  )
  // const onUnderline = useCallback(
  //   () => editor.chain().focus().toggleUnderline().run(),
  //   [editor]
  // )
  const onCode = useCallback(
    () => editor.chain().focus().toggleCode().run(),
    [editor]
  )
  const onCodeBlock = useCallback(
    () => editor.chain().focus().toggleCodeBlock().run(),
    [editor]
  )

  // const onSubscript = useCallback(
  //   () => editor.chain().focus().toggleSubscript().run(),
  //   [editor]
  // )
  // const onSuperscript = useCallback(
  //   () => editor.chain().focus().toggleSuperscript().run(),
  //   [editor]
  // )
  // const onAlignLeft = useCallback(
  //   () => editor.chain().focus().setTextAlign("left").run(),
  //   [editor]
  // )
  // const onAlignCenter = useCallback(
  //   () => editor.chain().focus().setTextAlign("center").run(),
  //   [editor]
  // )
  // const onAlignRight = useCallback(
  //   () => editor.chain().focus().setTextAlign("right").run(),
  //   [editor]
  // )
  // const onAlignJustify = useCallback(
  //   () => editor.chain().focus().setTextAlign("justify").run(),
  //   [editor]
  // )

  // const onChangeColor = useCallback(
  //   (color: string) => editor.chain().setColor(color).run(),
  //   [editor]
  // )
  // const onClearColor = useCallback(
  //   () => editor.chain().focus().unsetColor().run(),
  //   [editor]
  // )

  // const onChangeHighlight = useCallback(
  //   (color: string) => editor.chain().setHighlight({ color }).run(),
  //   [editor]
  // )
  // const onClearHighlight = useCallback(
  //   () => editor.chain().focus().unsetHighlight().run(),
  //   [editor]
  // )

  const onLink = useCallback(() => {
    if (editor.isActive("link")) {
      window.dispatchEvent(new CustomEvent("editor:link"))
      return
    }

    if (editor.state.selection.empty) {
      try {
        editor.commands.selectTextblockEnd()
      } catch {}
    }

    window.dispatchEvent(new CustomEvent("editor:link"))
  }, [editor])

  // Extract title and content from selected text
  const extractContent = useCallback(() => {
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, "\n")

    // Split by newline to get the first line as title
    const lines = selectedText.split("\n")
    const firstLine = lines[0].trim() || "Untitled"

    // Create the title with source information
    let title = firstLine

    // Use the entire selected text as content
    const content = `<p>${selectedText
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br />")}</p>`

    return { title, content }
  }, [editor])

  return {
    onBold,
    onItalic,
    onStrike,
    // onUnderline,
    onCode,
    onCodeBlock,
    // onSubscript,
    // onSuperscript,
    // onAlignLeft,
    // onAlignCenter,
    // onAlignRight,
    // onAlignJustify,
    // onChangeColor,
    // onClearColor,
    // onChangeHighlight,
    // onClearHighlight,
    // onSetFont,
    // onSetFontSize,
    onLink,
  }
}
