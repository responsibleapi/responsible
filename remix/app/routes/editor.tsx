import React, { lazy, Suspense } from "react"
import type { LinksFunction } from "@remix-run/cloudflare"

import { Spinner } from "../main/jsx/Spinner"
import { highlightCSS } from "../main/jsx/HighlightedEditor"

const SplitEditor = lazy(() => import("../main/jsx/SplitEditor"))

export const links: LinksFunction = () => [highlightCSS]

export default function Editor(): JSX.Element {
  return (
    <Suspense fallback={<Spinner />}>
      <SplitEditor />
    </Suspense>
  )
}
