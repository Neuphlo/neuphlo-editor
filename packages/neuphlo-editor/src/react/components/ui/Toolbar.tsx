import { ButtonHTMLAttributes, HTMLProps, forwardRef } from "react"
import { cn } from "../../utils/cn"
import { Surface } from "./Surface"
import { Button, ButtonProps } from "./Button"
import Tooltip from "./Tooltip"

export type ToolbarWrapperProps = {
  shouldShowContent?: boolean
  isVertical?: boolean
} & HTMLProps<HTMLDivElement>

const ToolbarWrapper = forwardRef<HTMLDivElement, ToolbarWrapperProps>(
  (
    {
      shouldShowContent = true,
      children,
      isVertical = false,
      className,
      ...rest
    },
    ref
  ) => {
    const toolbarClassName = cn(
      "nph-toolbar",
      isVertical ? "nph-toolbar--vertical" : "nph-toolbar--horizontal",
      className
    )

    return (
      shouldShowContent && (
        <Surface className={toolbarClassName} {...rest} ref={ref}>
          {children}
        </Surface>
      )
    )
  }
)

ToolbarWrapper.displayName = "Toolbar"

export type ToolbarDividerProps = {
  horizontal?: boolean
} & HTMLProps<HTMLDivElement>

const ToolbarDivider = forwardRef<HTMLDivElement, ToolbarDividerProps>(
  ({ horizontal, className, ...rest }, ref) => {
    const dividerClassName = cn(
      "nph-toolbar-divider",
      horizontal ? "nph-toolbar-divider--horizontal" : "nph-toolbar-divider--vertical",
      className
    )

    return <div className={dividerClassName} ref={ref} {...rest} />
  }
)

ToolbarDivider.displayName = "Toolbar.Divider"

export type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  activeClassname?: string
  tooltip?: string
  tooltipShortcut?: string[]
  buttonSize?: ButtonProps["buttonSize"]
  variant?: ButtonProps["variant"]
}

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      children,
      buttonSize = "icon",
      variant = "ghost",
      className,
      tooltip,
      tooltipShortcut,
      activeClassname,
      ...rest
    },
    ref
  ) => {
    const buttonClass = cn("nph-toolbar-button", className)

    const content = (
      <Button
        activeClassname={activeClassname}
        className={buttonClass}
        variant={variant}
        buttonSize={buttonSize}
        ref={ref}
        {...rest}
      >
        {children}
      </Button>
    )

    if (tooltip) {
      return (
        <Tooltip title={tooltip} shortcut={tooltipShortcut}>
          {content}
        </Tooltip>
      )
    }

    return content
  }
)

ToolbarButton.displayName = "ToolbarButton"

export const Toolbar = {
  Wrapper: ToolbarWrapper,
  Divider: ToolbarDivider,
  Button: ToolbarButton,
}
