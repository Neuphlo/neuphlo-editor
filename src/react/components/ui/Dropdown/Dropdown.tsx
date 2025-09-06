import React from "react"
import { cn } from "../../../utils/cn"

export const DropdownCategoryTitle = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="nph-dropdown-title">
      {children}
    </div>
  )
}

export const DropdownButton = React.forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode
    isActive?: boolean
    onClick?: () => void
    disabled?: boolean
    className?: string
  }
>(function DropdownButtonInner(
  { children, isActive, onClick, disabled, className },
  ref
) {
  const buttonClass = cn("nph-dropdown-button", className)

  return (
    <button
      className={buttonClass}
      disabled={disabled}
      data-active={isActive ? "true" : undefined}
      onClick={onClick}
      ref={ref}
    >
      {children}
    </button>
  )
})
