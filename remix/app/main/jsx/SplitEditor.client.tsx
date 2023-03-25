import type { Dispatch, SetStateAction } from "react"
import React, { useEffect, useMemo, useState } from "react"
import type { OpenAPIV3 } from "openapi-types"
import { parse } from "kdljs"
import CodeMirror from "@uiw/react-codemirror"
import { jsonLanguage } from "@codemirror/lang-json"

import { parseOpenAPI } from "../../../../generator/src/kdl"
import { exampleKDL } from "../examplekdl"

const useLocalStorage = (
  k: string,
  dflt: string,
): [v: string, d: Dispatch<SetStateAction<string>>] => {
  const [v, setV] = useState(dflt)

  useEffect(() => setV(localStorage.getItem(k) ?? dflt), [k, dflt])

  useEffect(() => localStorage.setItem(k, v), [k, v])

  return [v, setV]
}

export default function SplitEditor(): JSX.Element {
  if (typeof window === "undefined") {
    throw Error("LandingMirror should only render on the client.")
  }

  const [kdl, setKDL] = useLocalStorage("kdl", exampleKDL)

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
    <div className="flex min-h-screen w-full flex-1 flex-row divide-x overflow-y-hidden">
      <CodeMirror
        theme="dark"
        className="flex-1"
        height={"100%"}
        value={kdl}
        onChange={str => setKDL(str || "")}
      />

      <CodeMirror
        theme="dark"
        className="flex-1"
        readOnly={true}
        height={"100%"}
        value={result}
        extensions={[jsonLanguage]}
      />
    </div>
  )
}
