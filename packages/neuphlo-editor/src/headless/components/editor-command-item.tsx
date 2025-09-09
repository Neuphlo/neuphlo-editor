import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

export interface EditorCommandItemProps extends ComponentPropsWithoutRef<"li"> {
  active?: boolean;
  onSelect?: () => void;
}

export const EditorCommandItem = forwardRef<HTMLLIElement, EditorCommandItemProps>(
  ({ className, active, onSelect, children, ...rest }, ref) => (
    <li
      ref={ref}
      role="option"
      aria-selected={!!active}
      className={[
        "nph-command__item",
        active ? "is-active" : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      {...rest}
    >
      {children}
    </li>
  ),
);

EditorCommandItem.displayName = "EditorCommandItem";

export default EditorCommandItem;

