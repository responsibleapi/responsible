import React, { useEffect, useMemo, useState } from "react"
import { parseOpenAPI } from "../../../generator/src/kdl"
import { jsonLanguage } from "@codemirror/lang-json"
import CodeMirror from "@uiw/react-codemirror"
import { exampleKDL } from "../examplekdl"
import { OpenAPIV3 } from "openapi-types"
import { parse } from "kdljs"

const LOCAL_STORAGE_KEY = "kdl"

const useSaveLocalStorage = (k: string, v: string): void =>
  useEffect(() => localStorage.setItem(k, v), [k, v])

// noinspection JSUnusedGlobalSymbols
export default function Index(): JSX.Element {
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
    <div className="flex flex-row w-full h-screen divide-x">
      <CodeMirror
        className="flex-1 h-full"
        height={"100%"}
        value={kdl}
        onChange={str => setKDL(str || "")}
      />

      <CodeMirror
        className="flex-1 h-full"
        readOnly={true}
        height={"100%"}
        value={result}
        extensions={[jsonLanguage]}
      />
    </div>
  )
}
