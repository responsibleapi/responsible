import { toOpenApi } from "../../../generator/src/openapi/to-open-api"
import type { CoreService } from "../../../generator/src/core/core"
import { kdlToCore } from "@responsible/generator/src/kdl"
import React, { useEffect, useMemo, useState } from "react"
import { jsonLanguage } from "@codemirror/lang-json"
import CodeMirror from "@uiw/react-codemirror"
import { exampleKDL } from "../examplekdl"
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

  const core: CoreService = useMemo(() => {
    try {
      return kdlToCore(parse(kdl).output ?? [])
    } catch (e) {
      return { info: { title: "", version: "" }, refs: {}, paths: {} }
    }
  }, [kdl])

  const result: string = useMemo(
    () => JSON.stringify(toOpenApi(core), null, 2) + "\n",
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
