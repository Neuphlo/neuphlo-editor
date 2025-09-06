import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import React, { JSX } from "react"
import { cn } from "../../../utils/cn"

const isMac =
  typeof window !== "undefined"
    ? navigator.userAgent.toLowerCase().includes("mac")
    : false

const ShortcutKey = ({ children }: { children: string }): JSX.Element => {
  const className = "nph-kbd"

  if (children === "Mod") {
    return <kbd className={className}>{isMac ? "⌘" : "Ctrl"}</kbd>
  }

  if (children === "Shift") {
    return <kbd className={className}>⇧</kbd>
  }

  if (children === "Alt") {
    return <kbd className={className}>{isMac ? "⌥" : "Alt"}</kbd>
  }

  return <kbd className={className}>{children}</kbd>
}

interface TooltipProps {
  children: React.ReactNode
  enabled?: boolean
  title?: string
  shortcut?: string[]
  className?: string
}

export const Tooltip = ({
  children,
  enabled = true,
  title,
  shortcut,
  className,
}: TooltipProps): JSX.Element => {
  if (!enabled) {
    return <>{children}</>
  }

  return (
    <TooltipPrimitive.Provider delayDuration={500}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span>{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={8}
            className={cn("nph-tooltip", className)}
          >
            {title && <span className="nph-tooltip-title">{title}</span>}
            {shortcut && (
              <span className="nph-tooltip-shortcut">
                {shortcut.map((shortcutKey) => (
                  <ShortcutKey key={shortcutKey}>{shortcutKey}</ShortcutKey>
                ))}
              </span>
            )}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export default Tooltip
