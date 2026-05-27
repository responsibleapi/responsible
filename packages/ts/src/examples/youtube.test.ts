import { writeFile } from "node:fs/promises"
import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import yaml from "./youtube.yaml" with { type: "yaml" }
import youtubeAPI from "./youtube.ts"

describe("youtube example", () => {
  test("youtube.yaml validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(youtubeAPI))).toEqual(
      canonical(yaml as oas31.OpenAPIObject),
    )
  })

  test.skip("emit youtube.compiled.yaml", async () => {
    const filename = "youtube.compiled.yaml"
    const siblingJson = new URL(filename, import.meta.url)
    await writeFile(siblingJson, Bun.YAML.stringify(youtubeAPI), "utf-8")
  })
})
