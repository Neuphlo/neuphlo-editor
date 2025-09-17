import { useCurrentEditor } from "@tiptap/react";
import { BubbleMenu as BubbleMenuReact } from "@tiptap/react/menus";
import { useMemo } from "react";
import type { ReactNode } from "react";

export interface EditorBubbleProps {
  readonly className?: string;
  readonly children: ReactNode;
  readonly options?: Record<string, unknown>;
  readonly appendTo?: HTMLElement | null;
}

export function EditorBubble({
  className,
  children,
  options,
  appendTo,
}: EditorBubbleProps) {
  const { editor } = useCurrentEditor();
  if (!editor) return null;

  const resolvedAppendTo = useMemo(() => {
    if (appendTo !== undefined) return appendTo ?? undefined;
    if (typeof document === "undefined") return undefined;
    return document.body;
  }, [appendTo]);

  return (
    <BubbleMenuReact
      editor={editor}
      options={options}
      appendTo={resolvedAppendTo}
    >
      <div className={className}>{children}</div>
    </BubbleMenuReact>
  );
}
