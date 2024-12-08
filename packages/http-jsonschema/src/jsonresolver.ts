import type { oas31 } from "openapi3-ts"
import { memoize } from "./common"

/** it's shallow */
type JsonPointer<X> = "#/" | `#/${Exclude<keyof X, symbol>}${string}`

function deref<Root extends object>(
  root: Root,
  ptr: JsonPointer<Root>,
): unknown {
  const parts = ptr.split("/")

  // delete first '#'
  parts.shift()
  // delete last ''
  if (parts[parts.length - 1] === "") parts.pop()

  let ret: unknown = root

  for (const part of parts) {
    if (ret === undefined || ret === null) return undefined

    ret = (ret as Record<string, unknown>)[part]
  }

  return ret
}

export class JsonResolver<Root extends object> {
  constructor(public readonly root: Root) {}

  resolveRaw: (ptr: JsonPointer<Root>) => ReturnType<typeof deref<Root>> =
    memoize(ptr => deref(this.root, ptr))

  resolve = <R extends object>(t: oas31.ReferenceObject | R): R =>
    "$ref" in t ? (this.resolveRaw(t.$ref as JsonPointer<Root>) as R) : t
}
