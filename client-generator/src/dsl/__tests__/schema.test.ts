import { describe, expect, test } from "vitest"

import { httpURL, string } from "../schema"

describe.concurrent("schema", () => {
  test("http URL", () => {
    const s = httpURL()
    expect(s.type).toBe("string")
    expect(s.format).toBe("uri")
    expect(s.template).toBeDefined()
  })
})
