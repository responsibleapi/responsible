import { parseOpenAPI } from "../../../generator/src/kdl"
import { Header } from "../main/Header"
import { jsonLanguage } from "@codemirror/lang-json"
import CodeMirror from "@uiw/react-codemirror"
import React, { useEffect, useMemo, useState } from "react"
import { parse } from "kdljs"
import { exampleKDL } from "../examplekdl"
import type { OpenAPIV3 } from "openapi-types"

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
    <div className="flex h-screen w-full flex-col">
      <Header />

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
    </div>
  )
}
