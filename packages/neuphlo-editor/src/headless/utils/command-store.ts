type Range = { from: number; to: number } | null

type State = {
  query: string
  range: Range
  content: any | null
}

const state: State = { query: "", range: null, content: null }
const listeners = new Set<() => void>()

export function getState(): State {
  return state
}

export function setQuery(query: string) {
  state.query = query
  emit()
}

export function setRange(range: Range) {
  state.range = range
  emit()
}

export function setContent(content: any | null) {
  state.content = content
  emit()
}

export function getContent() {
  return state.content
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit() {
  for (const l of listeners) l()
}
