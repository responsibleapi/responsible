import { describe, expect, test } from "vitest"
import { PATCH } from "../index.ts"
import { object, string } from "./schema.ts"

describe("HTTP method helpers", () => {
  test("PATCH emits its method with and without an explicit id", () => {
    const op = {
      req: object({ name: string() }),
      res: { 204: {} },
    }

    expect(PATCH(op)).toEqual({
      ...op,
      method: "PATCH",
    })
    expect(PATCH("updateItem", op)).toEqual({
      ...op,
      method: "PATCH",
      id: "updateItem",
    })
  })
})
