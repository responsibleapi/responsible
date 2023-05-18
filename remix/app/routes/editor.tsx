import { highlightCSS } from "../main/jsx/HighlightedEditor"
import { Spinner } from "../main/jsx/Spinner"
import { Strings } from "../main/strings"
import { type LinksFunction, type V2_MetaFunction } from "@remix-run/cloudflare"
import React, { type JSX, lazy, Suspense } from "react"

const SplitEditor = lazy(() => import("../main/jsx/SplitEditor"))

export const links: LinksFunction = () => [highlightCSS]

export const meta: V2_MetaFunction = () => [
  { title: `Editor - ${Strings.title}` },
  { name: "description", content: Strings.description },
]

export default function Editor(): JSX.Element {
  return (
    <Suspense fallback={<Spinner />}>
      <SplitEditor />
    </Suspense>
  )
}
