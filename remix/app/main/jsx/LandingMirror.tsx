import React from "react"

import { exampleKDL } from "../examplekdl"
import { HighlightedEditor } from "./HighlightedEditor"

export default function LandingMirror(): JSX.Element {
  return (
    <HighlightedEditor
      className="mt-16 overflow-hidden rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 sm:mt-24"
      language="kdl"
      value={exampleKDL}
      readOnly
    />
  )
}
