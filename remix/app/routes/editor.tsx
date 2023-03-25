import React, { lazy, Suspense } from "react"

import { Spinner } from "../main/jsx/Spinner"

const SplitEditor = lazy(() => import("../main/jsx/SplitEditor.client"))

export default function Editor(): JSX.Element {
  return (
    <Suspense fallback={<Spinner />}>
      <SplitEditor />
    </Suspense>
  )
}
