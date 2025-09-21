import { useCurrentEditor } from "@tiptap/react";
import { BubbleMenu as BubbleMenuReact } from "@tiptap/react/menus";
import type { BubbleMenuProps } from "@tiptap/react/menus";
import type { ReactNode } from "react";

type ForwardedBubbleProps = Omit<BubbleMenuProps, "editor" | "children" | "className">;

export interface EditorBubbleProps extends ForwardedBubbleProps {
  readonly className?: string;
  readonly children: ReactNode;
}

export function EditorBubble({ className, children, ...rest }: EditorBubbleProps) {
  const { editor } = useCurrentEditor();
  if (!editor) return null;

  return (
    <BubbleMenuReact editor={editor} {...rest}>
      <div className={className}>{children}</div>
    </BubbleMenuReact>
  );
}
