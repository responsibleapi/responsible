import React from "react"
import CodeMirror from "@uiw/react-codemirror"

import { exampleKDL } from "../examplekdl"

export default function LandingMirror(): JSX.Element {
  return (
    <CodeMirror
      className="mt-16 overflow-hidden rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 sm:mt-24"
      value={exampleKDL}
      theme="dark"
      readOnly
    />
  )
}
