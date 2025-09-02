import { BubbleMenu, useCurrentEditor } from "@tiptap/react"
import { memo } from "react"

// Components
import { Toolbar } from "../../components/ui/Toolbar"
import { ContentTypePicker } from "../../components/ContentTypePicker"

// Hooks
import { useTextmenuContentTypes } from "./hooks/useTextmenuContentTypes"
import { useTextmenuCommands } from "./hooks/useTextmenuCommands"
import { useTextmenuStates } from "./hooks/useTextmenuStates"
import { IconBold, IconItalic } from "@tabler/icons-react"

const MemoButton = memo(Toolbar.Button)
const MemoContentTypePicker = memo(ContentTypePicker)

export function Selection() {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const commands = useTextmenuCommands(editor)
  const states = useTextmenuStates(editor)
  const blockOptions = useTextmenuContentTypes(editor)

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ placement: "top", duration: 120, interactive: true, hideOnClick: false }}
      shouldShow={({ editor, from, to }) => {
        if (from === to) return false
        if (editor.isActive("codeBlock")) return false
        return true
      }}
      className="nph-bubble"
    >
      <Toolbar.Wrapper>
        <MemoContentTypePicker options={blockOptions} />

        <MemoButton
          tooltip="Bold"
          tooltipShortcut={["Mod", "B"]}
          onClick={commands.onBold}
          active={states.isBold}
        >
          <IconBold className="nph-icon" />
        </MemoButton>

        <MemoButton
          tooltip="Italic"
          tooltipShortcut={["Mod", "I"]}
          onClick={commands.onItalic}
          active={states.isItalic}
        >
          <IconItalic className="nph-icon" />
        </MemoButton>
      </Toolbar.Wrapper>
    </BubbleMenu>
  )
}
