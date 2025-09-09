import { useCurrentEditor } from "@tiptap/react";
import { BubbleMenu as BubbleMenuReact } from "@tiptap/react/menus";
import type { ReactNode } from "react";

export interface EditorBubbleProps {
  readonly className?: string;
  readonly children: ReactNode;
  readonly options?: Record<string, unknown>;
}

export function EditorBubble({ className, children, options }: EditorBubbleProps) {
  const { editor } = useCurrentEditor();
  if (!editor) return null;

  return (
    <BubbleMenuReact editor={editor} options={options}>
      <div className={className}>{children}</div>
    </BubbleMenuReact>
  );
}
