import { expect, test } from "vitest"

test.concurrent("noop", () => {
  expect(1 + 1).toBe(2)
})
