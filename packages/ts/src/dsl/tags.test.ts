import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import type { Assert, IsEqual, OneExtendsTwo } from "../help/type-assertions.ts"
import { declareTags } from "./tags.ts"

describe("tags", () => {
  test("uses registry keys as tag names", () => {
    const tags = declareTags({
      videos: { description: "Video endpoints" },
      channels: {},
    } as const)

    expect(tags.videos).toMatchObject({
      description: "Video endpoints",
      name: "videos",
    })
    expect(tags.channels).toMatchObject({
      name: "channels",
    })
  })

  test("preserves literal tag names in the declared registry", () => {
    const tags = declareTags({
      videos: {},
    } as const)

    type _Test = Assert<IsEqual<(typeof tags)["videos"]["name"], "videos">>
  })

  test("declared tags are oas31.TagObject for strict deep equality checks", () => {
    const tags = declareTags({
      videos: { description: "Video endpoints" },
    } as const)

    type VideoTag = (typeof tags)["videos"]
    type _ExtendsTagObject = Assert<OneExtendsTwo<VideoTag, oas31.TagObject>>
  })
})
