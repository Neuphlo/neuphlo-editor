import { useCurrentEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  IconUpload,
  IconTrash,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"

export type ImageMenuProps = {
  className?: string
}

export function ImageMenu({ className }: ImageMenuProps) {
  const { editor } = useCurrentEditor()
  const [size, setSize] = useState<number>(100)
  const [align, setAlign] = useState<"left" | "center" | "right">("left")

  useEffect(() => {
    if (!editor) return
    const update = () => {
      if (!editor.isActive("image")) return
      const attrs = editor.getAttributes("image") ?? {
        width: "",
        align: "left",
      }
      const width = attrs.width ?? ""
      if (width.includes("%")) {
        setSize(parseInt(width) || 100)
      } else {
        setSize(100)
      }
      setAlign(attrs.align ?? "left")
    }
    update()
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    editor.on("update", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
      editor.off("update", update)
    }
  }, [editor])

  if (!editor) return null

  const updateImageSize = (newSize: number) => {
    setSize(newSize)
    editor.commands.updateAttributes("image", {
      width: `${newSize}%`,
    })
  }

  const updateImageAlign = (newAlign: "left" | "center" | "right") => {
    setAlign(newAlign)
    editor.commands.updateAttributes("image", { align: newAlign })
  }

  const removeImage = () => {
    editor.chain().focus().deleteSelection().run()
  }

  const triggerUpload = () => {
    ;(editor as any).chain().focus().uploadImage().run()
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e }) => {
        return e.isActive("image")
      }}
    >
      <div className={className ? `bubble-menu ${className}` : "bubble-menu"}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 140,
          }}
        >
          <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
            {size}%
          </span>
          <input
            type="range"
            min="25"
            max="100"
            step="5"
            value={size}
            onChange={(e) => updateImageSize(parseInt(e.target.value))}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ flex: 1 }}
          />
        </div>
        <div
          className="nph-link-popover__divider"
          style={{ margin: "0 4px" }}
        />
        <button
          type="button"
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "left" ? " is-active" : ""}`}
          title="Align left"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => updateImageAlign("left")}
        >
          <IconAlignLeft size={16} />
        </button>
        <button
          type="button"
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "center" ? " is-active" : ""}`}
          title="Align center"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => updateImageAlign("center")}
        >
          <IconAlignCenter size={16} />
        </button>
        <button
          type="button"
          className={`nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon${align === "right" ? " is-active" : ""}`}
          title="Align right"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => updateImageAlign("right")}
        >
          <IconAlignRight size={16} />
        </button>
        <div
          className="nph-link-popover__divider"
          style={{ margin: "0 4px" }}
        />
        <button
          type="button"
          className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
          title="Upload new image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={triggerUpload}
        >
          <IconUpload size={16} />
        </button>
        <button
          type="button"
          className="nph-btn nph-btn-ghost nph-btn-xs nph-btn-icon"
          title="Remove image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={removeImage}
        >
          <IconTrash size={16} />
        </button>
      </div>
    </BubbleMenu>
  )
}

export default ImageMenu
