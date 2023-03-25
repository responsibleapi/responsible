import { expect, test } from "vitest"

import { registeredHighlight } from "./highlight"

test.concurrent("HighlightKDL", () => {
  expect(
    registeredHighlight(
      `
struct "InfoReq" {
  url "httpURL"
  opts "YtDlOpts"
}
`,
      "kdl",
    ),
  ).toEqual(`
struct <span class="hljs-string">&quot;InfoReq&quot;</span> {
  url <span class="hljs-string">&quot;httpURL&quot;</span>
  opts <span class="hljs-string">&quot;YtDlOpts&quot;</span>
}
`)
})
