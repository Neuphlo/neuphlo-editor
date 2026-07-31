import type { ComponentType } from "react"
import {
  NodeViewContent,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react"

export type TaskItemCheckboxProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export type TaskItemCheckboxComponent = ComponentType<TaskItemCheckboxProps>

export const createTaskItemView = (
  Checkbox: TaskItemCheckboxComponent,
) => {
  const TaskItemView = ({ node, updateAttributes, editor }: NodeViewProps) => {
    const checked = !!node.attrs.checked

    return (
      <NodeViewWrapper
        as="li"
        data-checked={checked}
        className="nph-task-item"
      >
        <label contentEditable={false} className="nph-task-item__checkbox">
          <Checkbox
            checked={checked}
            disabled={!editor.isEditable}
            onCheckedChange={(value) => {
              if (!editor.isEditable) return
              updateAttributes({ checked: value === true })
            }}
          />
        </label>
        <NodeViewContent
          as="div"
          className={
            "nph-task-item__content" +
            (checked ? " nph-task-item__content--checked" : "")
          }
        />
      </NodeViewWrapper>
    )
  }
  TaskItemView.displayName = "TaskItemView"
  return TaskItemView
}
