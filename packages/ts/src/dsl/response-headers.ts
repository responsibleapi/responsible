import type { Nameable } from "./nameable.ts"
import type { Schema } from "./schema.ts"

export interface HeaderRaw {
  description?: string
  schema: Schema
  required?: boolean
  deprecated?: boolean
  example?: unknown
}

/**
 * Reusable response header under `components.headers` when passed as a
 * {@link Nameable} thunk in
 * {@link import("./operation.ts").RespParams.headerParams}.
 *
 * @dsl
 */
export type ReusableHeader = Nameable<HeaderRaw>

export const responseHeader = (r: HeaderRaw): HeaderRaw => ({ ...r })
