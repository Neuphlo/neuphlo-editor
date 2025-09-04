import React, { Suspense } from "react"
const LazyEditor = React.lazy(() =>
  import("neuphlo-editor/react").then((m) => ({ default: m.Editor }))
)
import defaultContent from "./content/default.html?raw"
import Navigation from "./components/Navigation"

export default function App() {
  return (
    <>
      <Navigation />

      <div className="mx-auto w-full max-w-5xl py-28">
        <div className="grid gap-6 p-6 mx-auto max-w-7xl rounded-xl ring-1 ring-black/10 dark:ring-white/10">
          <Suspense fallback={<div>Loading editor…</div>}>
            <LazyEditor content={defaultContent} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
