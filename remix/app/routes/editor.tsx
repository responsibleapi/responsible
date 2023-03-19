import React, { lazy, Suspense } from "react"

const SplitEditor = lazy(() => import("../main/jsx/SplitEditor"))

export default function Editor(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SplitEditor />
    </Suspense>
  )
}
