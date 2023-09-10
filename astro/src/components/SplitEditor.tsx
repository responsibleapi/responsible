import { edit } from "ace-builds"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/ext-searchbox"
import "./kdl.js"
import { parse } from "kdljs"
import { createEffect, type Component, type JSX } from "solid-js"
import { parseOpenAPI } from "../../../generator/src/kdl"
import { exampleKDL } from "../app/examplekdl.ts"

const Editor: Component<{
  id: string
  children: JSX.Element
}> = props => (
  <div class="flex flex-1 flex-col">
    <h2 class="mx-6 mb-4 flex-shrink-0 text-lg font-bold">{props.children}</h2>
    <div id={props.id} class="flex-1" />
  </div>
)

export const SplitEditor: Component = () => {
  createEffect(() => {
    const kdlEditor = edit("editor1", {
      showPrintMargin: false,
      mode: "ace/mode/kdl",
      useWorker: false,
    })
    const jsonEditor = edit("editor2", {
      showPrintMargin: false,
      mode: "ace/mode/json",
      readOnly: true,
      useWorker: false,
    })

    kdlEditor.on("change", () => {
      const kdl = kdlEditor.getValue()
      const pd = parse(kdl)
      if (!pd.output) return

      try {
        const openAPI = parseOpenAPI(pd.output)
        const json = JSON.stringify(openAPI, null, 2)
        jsonEditor.setValue(json, 1)

        localStorage.setItem("kdl", kdl)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    })

    const kdl = localStorage.getItem("kdl")
    kdlEditor.setValue(kdl ?? exampleKDL, 1)
  })

  return (
    <div class="flex flex-1 flex-row">
      <Editor id="editor1">ResponsibleAPI</Editor>
      <Editor id="editor2">OpenAPI</Editor>
    </div>
  )
}
