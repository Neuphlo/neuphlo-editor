// Auto-apply default styles when consuming the React entry
import "../styles.css";

export { Editor } from "./Editor";
export type {
  NeuphloEditorProps as EditorProps,
  BubbleMenuExtras,
  BubbleMenuExtraRenderer,
  BubbleMenuExtra,
} from "./Editor";
export { TextMenu } from "./menus";
export type { TextMenuProps } from "./menus";
