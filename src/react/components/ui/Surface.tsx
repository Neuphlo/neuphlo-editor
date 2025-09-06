import { cn } from "../../utils/cn"
import { HTMLProps, forwardRef } from "react"

export type SurfaceProps = HTMLProps<HTMLDivElement> & {
  withShadow?: boolean
  withBorder?: boolean
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    { children, className, withShadow = true, withBorder = true, ...props },
    ref
  ) => {
    const surfaceClass = cn(
      className,
      "nph-surface",
      withShadow ? "nph-surface--shadow" : "",
      withBorder ? "nph-surface--border" : ""
    )

    return (
      <div className={surfaceClass} {...props} ref={ref}>
        {children}
      </div>
    )
  }
)

Surface.displayName = "Surface"
