import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ComponentPropsWithoutRef, FC, ReactNode } from "react"

type Range = { from: number; to: number }

type Ctx = {
  query: string
  setQuery: (q: string) => void
  range: Range | null
  setRange: (r: Range | null) => void
}

const EditorCommandContext = createContext<Ctx | null>(null)

export function useEditorCommand() {
  const ctx = useContext(EditorCommandContext)
  if (!ctx)
    throw new Error("useEditorCommand must be used within <EditorCommand>")
  return ctx
}

export interface EditorCommandProps extends ComponentPropsWithoutRef<"div"> {
  readonly children?: ReactNode
}

export const EditorCommand = forwardRef<HTMLDivElement, EditorCommandProps>(
  ({ className, children, ...rest }, ref) => {
    const [query, setQuery] = useState("")
    const [range, setRange] = useState<Range | null>(null)

    const value = useMemo<Ctx>(
      () => ({ query, setQuery, range, setRange }),
      [query, range]
    )

    return (
      <EditorCommandContext.Provider value={value}>
        <div
          ref={ref}
          id="nph-slash-command"
          className={["nph-command", className].filter(Boolean).join(" ")}
          onKeyDown={(e) => {
            if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
              e.stopPropagation()
            }
          }}
          {...rest}
        >
          <input
            style={{ display: "none" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {children}
        </div>
      </EditorCommandContext.Provider>
    )
  }
)
EditorCommand.displayName = "EditorCommand"

export const EditorCommandList = forwardRef<
  HTMLUListElement,
  ComponentPropsWithoutRef<"ul">
>(({ className, children, ...rest }, ref) => (
  <ul
    ref={ref}
    role="listbox"
    className={["nph-command__list", className].filter(Boolean).join(" ")}
    {...rest}
  >
    {children}
  </ul>
))
EditorCommandList.displayName = "EditorCommandList"

interface EditorCommandOutProps {
  readonly query: string
  readonly range: Range
}

export const EditorCommandOut: FC<EditorCommandOutProps> = ({
  query,
  range,
}) => {
  const ctx = useContext(EditorCommandContext)

  useEffect(() => {
    ctx?.setQuery(query)
  }, [query])

  useEffect(() => {
    ctx?.setRange(range)
  }, [range])

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"]
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault()
        const commandRef = document.querySelector("#nph-slash-command")
        if (commandRef)
          commandRef.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: e.key,
              cancelable: true,
              bubbles: true,
            })
          )
        return false
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return null
}
