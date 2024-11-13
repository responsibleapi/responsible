import { config, edit } from "ace-builds"
import "ace-builds/src-noconflict/ext-searchbox"
import "ace-builds/src-noconflict/mode-json"
import { parse as kdlParse } from "kdljs"
import { createEffect, type Component, type JSX } from "solid-js"
import { toOpenAPI } from "../../generator/src/kdl"
import { exampleKDL } from "./examplekdl"
import aceModeKDL from "./kdl.js?url"

config.setModuleUrl("ace/mode/kdl", aceModeKDL)

const Editor: Component<{
  id: string
  children: JSX.Element
}> = props => (
  <div class="flex flex-1 flex-col">
    <h2 class="mx-6 mb-4 flex-shrink-0 text-lg font-bold">{props.children}</h2>
    <div id={props.id} class="flex-1" />
  </div>
)

const CURSOR_POS = 1

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
      const kdlStr = kdlEditor.getValue()
      const parsedKDL = kdlParse(kdlStr)
      if (!parsedKDL.output) return

      try {
        const openAPI = toOpenAPI(parsedKDL.output)
        const json = JSON.stringify(openAPI, null, 2)
        jsonEditor.setValue(json, CURSOR_POS)

        localStorage.setItem("kdl", kdlStr)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    })

    const kdl = localStorage.getItem("kdl")
    kdlEditor.setValue(kdl ?? exampleKDL, CURSOR_POS)
  })

  return (
    <div class="flex flex-1 flex-row">
      <Editor id="editor1">ResponsibleAPI</Editor>
      <Editor id="editor2">OpenAPI</Editor>
    </div>
  )
}
