import { cn } from "../../../utils/cn"
import React from "react"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "ghost"
export type ButtonSize = "medium" | "small" | "icon" | "iconSmall"

export type ButtonProps = {
  variant?: ButtonVariant
  active?: boolean
  activeClassname?: string
  buttonSize?: ButtonSize
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      active,
      buttonSize = "medium",
      children,
      disabled,
      variant = "primary",
      className,
      activeClassname,
      ...rest
    },
    ref
  ) => {
    const buttonClassName = cn(
      "nph-btn",
      variant === "primary" && "nph-btn--primary",
      variant === "secondary" && "nph-btn--secondary",
      variant === "tertiary" && "nph-btn--tertiary",
      variant === "ghost" && "nph-btn--ghost",
      active && cn("nph-btn--active", activeClassname),
      buttonSize === "medium" && "nph-btn--md",
      buttonSize === "small" && "nph-btn--sm",
      buttonSize === "icon" && "nph-btn--icon",
      buttonSize === "iconSmall" && "nph-btn--icon-sm",
      className
    )

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={buttonClassName}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
