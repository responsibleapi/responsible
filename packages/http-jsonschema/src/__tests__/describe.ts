import { describe as desc } from "vitest"

/** bun test support */
export const describe = "concurrent" in desc ? desc.concurrent : desc
