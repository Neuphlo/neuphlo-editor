import { Icon, type IconName } from "./ui/Icon"
import { useMemo } from "react"
import * as Dropdown from "@radix-ui/react-dropdown-menu"
import { Toolbar } from "../components/ui/Toolbar"
import { Surface } from "../components/ui/Surface"
import {
  DropdownButton,
  DropdownCategoryTitle,
} from "../components/ui/Dropdown"

export type ContentTypePickerOption = {
  label: string
  id: string
  type: "option"
  disabled: () => boolean
  isActive: () => boolean
  onClick: () => void
  icon: IconName
}

export type ContentTypePickerCategory = {
  label: string
  id: string
  type: "category"
}

export type ContentPickerOptions = Array<
  ContentTypePickerOption | ContentTypePickerCategory
>

export type ContentTypePickerProps = {
  options: ContentPickerOptions
}

const isOption = (
  option: ContentTypePickerOption | ContentTypePickerCategory
): option is ContentTypePickerOption => option.type === "option"
const isCategory = (
  option: ContentTypePickerOption | ContentTypePickerCategory
): option is ContentTypePickerCategory => option.type === "category"

export const ContentTypePicker = ({ options }: ContentTypePickerProps) => {
  const activeItem = useMemo(
    () =>
      options.find((option) => option.type === "option" && option.isActive()),
    [options]
  )

  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <Toolbar.Button buttonSize="small">
          <Icon
            name={
              (activeItem?.type === "option" && activeItem.icon) ||
              "IconPilcrow"
            }
          />
          <Icon name="IconChevronDown" className="nph-icon" strokeWidth={3} />
        </Toolbar.Button>
      </Dropdown.Trigger>
      <Dropdown.Content
        side="bottom"
        align="start"
        alignOffset={-6}
        sideOffset={9}
        avoidCollisions={false}
        asChild
      >
        <Surface className="nph-menu-panel">
          {options.map((option) => {
            if (isOption(option)) {
              return (
                <DropdownButton
                  key={option.id}
                  onClick={option.onClick}
                  isActive={option.isActive()}
                >
                  <Icon name={option.icon} className="nph-icon nph-mr-1" />
                  {option.label}
                </DropdownButton>
              )
            } else if (isCategory(option)) {
              return (
                <div className="nph-category-gap" key={option.id}>
                  <DropdownCategoryTitle key={option.id}>
                    {option.label}
                  </DropdownCategoryTitle>
                </div>
              )
            }
          })}
        </Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  )
}
