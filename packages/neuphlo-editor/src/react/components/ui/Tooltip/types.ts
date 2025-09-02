import React from "react"

export interface TooltipProps {
  children?: string | React.ReactNode
  enabled?: boolean
  title?: string
  shortcut?: string[]
  content?: React.ReactNode
}
