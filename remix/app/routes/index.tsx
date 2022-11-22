import { genVertxKotlinClient } from "../../../generator/src/kotlin/vertx-client"
import { genPythonTypes } from "../../../generator/src/python/dataclasses"
import { toOpenApi } from "../../../generator/src/openapi/to-open-api"
import type { CoreService } from "../../../generator/src/core/core"
import { kdlToCore } from "../../../generator/src/dsl/kdl/kdl"
import React, { useEffect, useMemo, useState } from "react"
import { RadioGroup } from "@headlessui/react"
import { exampleKDL } from "../examplekdl"
import Editor from "@monaco-editor/react"
import { parse } from "kdljs"
import classNames from "clsx"

const formatObj = {
  openapi: "openapi",
  "vertx-kotlin": "vertx-kotlin",
  "python-types": "python-types",
} as const
type Format = typeof formatObj[keyof typeof formatObj]

const formatArr = Object.values(formatObj)

const labels: Record<Format, string> = {
  openapi: "OpenAPI",
  "vertx-kotlin": "Vert.x Kotlin",
  "python-types": "Python dataclasses",
}

const languages: Record<Format, string> = {
  openapi: "json",
  "vertx-kotlin": "kotlin",
  "python-types": "python",
}

const LOCAL_STORAGE_KEY = "kdl"
const LOCAL_STORAGE_FMT_KEY = "fmt"

const useSaveLocalStorage = (k: string, v: string): void =>
  useEffect(() => localStorage.setItem(k, v), [k, v])

// noinspection JSUnusedGlobalSymbols
export default function Index(): JSX.Element {
  const [kdl, setKDL] = useState("")
  const [fmt, setFmt] = useState(formatArr[0])

  useEffect(() => {
    setKDL(localStorage.getItem(LOCAL_STORAGE_KEY) ?? exampleKDL)
    setFmt(
      (localStorage.getItem(LOCAL_STORAGE_FMT_KEY) as Format) ?? formatArr[0],
    )
  }, [])

  useSaveLocalStorage(LOCAL_STORAGE_KEY, kdl)
  useSaveLocalStorage(LOCAL_STORAGE_FMT_KEY, fmt)

  const core: CoreService = useMemo(() => {
    try {
      return kdlToCore(parse(kdl).output ?? [])
    } catch (e) {
      console.error(e)
      return { info: { title: "", version: "" }, refs: {}, paths: {} }
    }
  }, [kdl])

  const result: string = useMemo(() => {
    switch (fmt) {
      case "python-types":
        return genPythonTypes(core)

      case "openapi":
        return JSON.stringify(toOpenApi(core), null, 2) + "\n"

      case "vertx-kotlin":
        // TODO think about introducing packageName to DSL
        return genVertxKotlinClient(core)
    }
  }, [core, fmt])

  return (
    <div className="flex flex-row w-full h-screen divide-x">
      <div className="flex-1">
        <Editor
          language="kdl"
          value={kdl}
          options={{ minimap: { enabled: false } }}
          onChange={str => setKDL(str || "")}
        />
      </div>

      <div className="flex flex-col flex-1">
        <RadioGroup
          value={fmt}
          onChange={setFmt}
          className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6"
        >
          {formatArr.map(option => (
            <RadioGroup.Option
              key={option}
              value={option}
              className={({ active, checked }) =>
                classNames(
                  "cursor-pointer focus:outline-none border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1",
                  {
                    "ring-2 ring-offset-2 ring-indigo-500": active,

                    "bg-indigo-600 border-transparent text-white hover:bg-indigo-700":
                      checked,

                    "bg-white border-gray-200 text-gray-900 hover:bg-gray-50":
                      !checked,
                  },
                )
              }
            >
              <RadioGroup.Label as="span">{labels[option]}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </RadioGroup>

        <div className={"h-full"}>
          <Editor
            options={{
              readOnly: true,
              minimap: { enabled: false },
            }}
            value={result}
            language={languages[fmt]}
          />
        </div>
      </div>
    </div>
  )
}
