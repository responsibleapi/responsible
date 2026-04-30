import type { oas31 } from "openapi3-ts"

/**
 * OpenAPI {@link oas31.ReferenceObject} fields other than `$ref` (e.g.
 * `summary`, `description`), aligned with openapi3-ts types.
 */
type OasRefSiblings = Omit<oas31.ReferenceObject, "$ref">

/**
 * Scalars are inlined as is in OpenAPI doc
 *
 * @dsl
 */
type Scalar<T> = T extends (...args: unknown[]) => unknown ? never : T

/**
 * In DSL positions that accept {@link Nameable}, passing a {@link NamedThunk}
 * emits an OpenAPI `{ "$ref": "#/components/<T>/<name>" }`, where `<name>`
 * comes from {@link Function.name}.
 *
 * Optional {@link OasRefSiblings} siblings (`summary`, `description`) may be
 * set via {@link ref}; they are meaningful when the compiler emits `$ref`
 * (follow-up).
 *
 * Never call the thunk, always pass the reference
 *
 * @dsl
 */
export type NamedThunk<T> = [Scalar<T>] extends [never]
  ? never
  : { (): Scalar<T> } & OasRefSiblings

export type Nameable<T> = NamedThunk<T> | Scalar<T>

/**
 * Creates a named thunk for component reuse in DSL positions that accept
 * {@link Nameable}. Pass the returned thunk itself when you want a `$ref`.
 *
 * Reference siblings (`summary`, `description`) are left unset; use {@link ref}
 * to attach them.
 */
export const named = <T>(name: string, value: Scalar<T>): NamedThunk<T> => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const thunk = (() => value) as NamedThunk<T>

  Object.defineProperty(thunk, "name", {
    value: name,
    writable: false,
    enumerable: false,
    configurable: true,
  })

  return thunk
}

/**
 * Wraps a {@link NamedThunk} with OpenAPI reference siblings. The returned thunk
 * keeps the same resolved value and copies {@link Function.name}. Existing
 * sibling values are preserved unless the outer wrapper overrides them.
 *
 * @dsl
 */
export const ref = <T>(
  thunk: NamedThunk<T>,
  fields: OasRefSiblings,
): NamedThunk<T> => {
  const wrapper = named(thunk.name, thunk())
  Object.assign(wrapper, thunk, fields)

  return wrapper
}

const isNamed = <T>(n: Nameable<T>): n is NamedThunk<T> =>
  typeof n === "function"

interface DecodedNameable<T> {
  name?: string
  value: Scalar<T>
  summary?: string
  description?: string
}

export function decodeNameable<T>(n: Nameable<T>): DecodedNameable<T> {
  if (!isNamed(n)) return { value: n }

  const out: DecodedNameable<T> = { name: n.name, value: n() }
  if (n.summary) {
    out.summary = n.summary
  }
  if (n.description) {
    out.description = n.description
  }
  return out
}
