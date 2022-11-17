import { toOpenApi } from "../../../generator/src/openapi/to-open-api"
import { toCore } from "../../../generator/src/dsl/kdl/kdl"
import React, { useEffect, useState } from "react"
import { RadioGroup } from "@headlessui/react"
import Editor from "@monaco-editor/react"
import { parse } from "kdljs"
import classNames from "clsx"

const Format = {
  openapi: "openapi",
  "vertx-kotlin": "vertx-kotlin",
  "python-types": "python-types",
} as const
type Format = typeof Format[keyof typeof Format]

const formats = Object.values(Format)

const labels: Record<Format, string> = {
  openapi: "OpenAPI",
  "vertx-kotlin": "Vert.x Kotlin",
  "python-types": "Python dataclasses",
}

export default function Index(): JSX.Element {
  const [kdl, setKDL] = useState("")
  const [format, setFormat] = useState(formats[2])
  const [result, setResult] = useState("")

  useEffect(() => {
    const { output } = parse(kdl)
    if (!output) return

    try {
      const c = toCore(output)
      switch (format) {
        case "python-types":
          break

        case "openapi":
          setResult(JSON.stringify(toOpenApi(c), null, 2))
          break

        case "vertx-kotlin":
          break

        default:
          throw new Error(format)
      }
    } catch (e) {
      console.error(e)
    }
  }, [kdl, format])

  return (
    <div className="flex flex-row w-full h-screen divide-x">
      <div className={"flex-1"}>
        <Editor
          options={{ minimap: { enabled: false } }}
          onChange={e => setKDL(e ?? "")}
        />
      </div>

      <div className="flex flex-col flex-1">
        <RadioGroup
          value={format}
          onChange={setFormat}
          className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6"
        >
          {formats.map(option => (
            <RadioGroup.Option
              key={option}
              value={option}
              className={({ active, checked }) =>
                classNames(
                  "cursor-pointer focus:outline-none border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1",
                  active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                  checked
                    ? "bg-indigo-600 border-transparent text-white hover:bg-indigo-700"
                    : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
                )
              }
            >
              <RadioGroup.Label as="span">{labels[option]}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </RadioGroup>

        <textarea className={"h-full"} defaultValue={result} />
      </div>
    </div>
  )
}
