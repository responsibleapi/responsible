import React, { useEffect, useMemo, useState } from "react"
import type { OpenAPIV3 } from "openapi-types"
import { parseOpenAPI } from "@responsible/generator/src/kdl"
import CodeMirror from "@uiw/react-codemirror"
import { jsonLanguage } from "@codemirror/lang-json"
import { parse } from "kdljs"

import { exampleKDL } from "../examplekdl"

const LOCAL_STORAGE_KEY = "kdl"

const useSaveLocalStorage = (k: string, v: string): void =>
  useEffect(() => localStorage.setItem(k, v), [k, v])

export const SplitEditor = () => {
  const [kdl, setKDL] = useState("")

  useEffect(() => {
    setKDL(localStorage.getItem(LOCAL_STORAGE_KEY) ?? exampleKDL)
  }, [])

  useSaveLocalStorage(LOCAL_STORAGE_KEY, kdl)

  const core: OpenAPIV3.Document = useMemo(() => {
    try {
      return parseOpenAPI(parse(kdl).output ?? [])
    } catch (e) {
      return { openapi: "3.0.1", info: { title: "", version: "" }, paths: {} }
    }
  }, [kdl])

  const result: string = useMemo(
    () => JSON.stringify(core, null, 2) + "\n",
    [core],
  )

  return (
    <div className="flex w-full flex-1 flex-row divide-x overflow-y-hidden">
      <CodeMirror
        className="flex-1"
        height={"100%"}
        value={kdl}
        onChange={str => setKDL(str || "")}
      />

      <CodeMirror
        className="flex-1"
        readOnly={true}
        height={"100%"}
        value={result}
        extensions={[jsonLanguage]}
      />
    </div>
  )
}
