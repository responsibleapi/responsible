import Ajv from "ajv"
import addFormats from "ajv-formats"
import type { oas31 } from "openapi3-ts"

export function mkAjv(doc: oas31.OpenAPIObject): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    /** https://github.com/ajv-validator/ajv-i18n?tab=readme-ov-file#usage */
    messages: false,
  })

  addFormats(ajv)

  const schemas = doc.components?.schemas
  for (const s in schemas) {
    ajv.addSchema(schemas[s], `#/components/schemas/${s}`)
  }

  return ajv
}

export function memoize<K extends PropertyKey, V>(
  fn: (k: K) => V,
): (k: K) => V {
  const cache = {} as Record<K, V>

  return k => {
    if (k in cache) return cache[k]

    cache[k] = fn(k)
    return cache[k]
  }
}

export function lowerCaseKeys<T>(
  obj: Readonly<Record<string, T>>,
): Readonly<Record<Lowercase<string>, T>> {
  const ret: Record<string, T> = {}
  for (const k in obj) {
    ret[k.toLowerCase()] = obj[k]
  }
  return ret
}

export const isObject = (o: unknown): o is object =>
  o !== null && typeof o === "object"

export async function asyncSome<T>(
  arr: readonly T[],
  fn: (t: T) => Promise<boolean>,
): Promise<boolean> {
  for (const t of arr) {
    if (await fn(t)) return true
  }
  return false
}

export async function asyncEvery<T>(
  arr: readonly T[],
  fn: (t: T) => Promise<boolean>,
): Promise<boolean> {
  for (const t of arr) {
    if (!(await fn(t))) return false
  }
  return true
}
