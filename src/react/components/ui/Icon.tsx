import { cn } from "../../utils/cn"
import { memo } from "react"
import {
  IconPilcrow,
  IconChevronDown,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
} from "@tabler/icons-react"

const iconMap = {
  IconPilcrow,
  IconChevronDown,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
}

export type IconName = keyof typeof iconMap

export type IconProps = {
  name: IconName
  className?: string
  strokeWidth?: number
}

export const Icon = memo(({ name, className, strokeWidth }: IconProps) => {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    return null
  }

  return (
    <IconComponent
      className={cn("nph-icon", className)}
      strokeWidth={strokeWidth || 2.5}
    />
  )
})

Icon.displayName = "Icon"
