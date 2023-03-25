import type { Dispatch, SetStateAction } from "react"
import React, { useEffect, useMemo, useState } from "react"
import type { OpenAPIV3 } from "openapi-types"
import { parse } from "kdljs"

import { parseOpenAPI } from "../../../../generator/src/kdl"
import { exampleKDL } from "../examplekdl"
import { HighlightedEditor } from "./HighlightedEditor"

const useLocalStorage = (
  k: string,
  dflt: string,
): [v: string, d: Dispatch<SetStateAction<string>>] => {
  const [v, setV] = useState(dflt)

  useEffect(() => {
    if (typeof localStorage === "undefined") return

    setV(localStorage.getItem(k) ?? dflt)
  }, [k, dflt])

  useEffect(() => {
    if (typeof localStorage === "undefined") return

    localStorage.setItem(k, v)
  }, [k, v])

  return [v, setV]
}

export default function SplitEditor(): JSX.Element {
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
    <div className="flex w-full flex-1 flex-row divide-x">
      <div className="h-[700px] flex-1 overflow-auto">
        <HighlightedEditor value={kdl} onChange={setKDL} language="kdl" />
      </div>

      <div className="h-[700px] flex-1 overflow-auto">
        <HighlightedEditor readOnly={true} value={result} language="json" />
      </div>
    </div>
  )
}
