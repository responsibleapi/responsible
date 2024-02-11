import { type Component, type ParentComponent } from "solid-js"
import { SplitEditor } from "./SplitEditor"

const External: ParentComponent<{ href: string }> = props => (
  <a href={props.href} target="_blank" rel="noreferrer noopener">
    {props.children}
  </a>
)

export const App: Component = () => (
  <main class="flex h-screen flex-col">
    <div class="prose prose-sky m-6 max-w-prose flex-shrink-0">
      <h1>ResponsibleAPI</h1>
      <p>A compact language that compiles to OpenAPI</p>
      <External href="https://github.com/responsibleapi/responsible#readme">
        Docs
      </External>
      <span> • </span>
      <External href="https://github.com/responsibleapi/responsible/discussions">
        Help
      </External>
    </div>

    <SplitEditor />
  </main>
)
