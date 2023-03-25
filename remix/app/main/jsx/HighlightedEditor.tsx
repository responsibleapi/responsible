import theme from "highlight.js/styles/github-dark.css"
import type { Dispatch, SetStateAction } from "react"
import React from "react"
import Editor from "react-simple-code-editor"
import type { LinkDescriptor } from "@remix-run/cloudflare"
import clsx from "clsx"

import { registeredHighlight } from "../highlight"

export const highlightCSS: LinkDescriptor = {
  rel: "stylesheet",
  href: theme,
}

export const HighlightedEditor = ({
  value,
  language,
  onChange,
  readOnly,
  className,
}: {
  value: string
  language: string
  onChange?: Dispatch<SetStateAction<string>>
  readOnly?: boolean
  className?: string
}) => (
  <Editor
    className={clsx("bg-gray-900 font-mono text-gray-50", className)}
    padding={10}
    readOnly={readOnly}
    value={value}
    onValueChange={onChange ?? (() => {})}
    highlight={code => registeredHighlight(code, language)}
  />
)
