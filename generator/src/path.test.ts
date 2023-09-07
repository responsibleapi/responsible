import { expect, test } from "vitest"
import { mergePaths, parsePath, TypedPath } from "./path"

test("parse", () => {
  const ps: Record<`/${string}`, TypedPath> = {
    "/later/:item_id(ItemID)": {
      path: "/later/{item_id}",
      types: { item_id: "ItemID" },
    },
    "/show/:show_id(ShowID)/items": {
      path: "/show/{show_id}/items",
      types: { show_id: "ShowID" },
    },
    "/feed/:show_id(ShowID)": {
      path: "/feed/{show_id}",
      types: { show_id: "ShowID" },
    },
    "/show/:show_id(ShowID)": {
      path: "/show/{show_id}",
      types: { show_id: "ShowID" },
    },
    "/show/:show_id(ShowID)/downloads": {
      path: "/show/{show_id}/downloads",
      types: { show_id: "ShowID" },
    },
    "/rss/:show_id(ShowID)/:type(AudioVideo).rss": {
      path: "/rss/{show_id}/{type}.rss",
      types: { show_id: "ShowID", type: "AudioVideo" },
    },
    "/rss/:show_id/:type.rss": {
      path: "/rss/{show_id}/{type}.rss",
      types: { show_id: "string", type: "string" },
    },
    "/": {
      path: "/",
      types: {},
    },
  }

  expect(Object.keys(ps).map(parsePath)).toEqual(Object.values(ps))
})

test("merge", () => {
  expect(
    mergePaths(
      {
        path: "/rss/:show_id/:type.rss",
        types: { show_id: "string", type: "string" },
      },
      {
        path: "/foo",
        types: {},
      },
    ),
  ).toEqual({
    path: "/rss/:show_id/:type.rss/foo",
    types: { show_id: "string", type: "string" },
  })

  expect(mergePaths({ path: "", types: {} }, { path: "", types: {} })).toEqual({
    path: "",
    types: {},
  })

  expect(
    mergePaths({ path: "", types: {} }, { path: "/login", types: {} }),
  ).toEqual({ path: "/login", types: {} })
})
