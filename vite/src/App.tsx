import { type Component } from "solid-js"
import { SplitEditor } from "./SplitEditor"

export const App: Component = () => (
  <main class="flex h-screen flex-col">
    <div class="prose prose-sky m-6 max-w-prose flex-shrink-0">
      <h1>ResponsibleAPI</h1>
      <p>A compact language that compiles to OpenAPI</p>
      <a
        href="https://github.com/responsibleapi/responsible#readme"
        target="_blank"
        rel="noreferrer noopener"
      >
        Docs
      </a>
    </div>

    <SplitEditor />
  </main>
)
