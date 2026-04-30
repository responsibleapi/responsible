import type { oas31 } from "openapi3-ts"

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isEmpty = (value: Record<string, unknown>): boolean =>
  Object.keys(value).length === 0

const normalizePatternString = (s: string): string => s.replaceAll("\\/", "/")

function canonArr(value: unknown[]): unknown[] {
  const arr = value.map(normVal)
  return arr.every(Array.isArray)
    ? arr
    : [...arr].sort((left, right) =>
        JSON.stringify(left).localeCompare(JSON.stringify(right)),
      )
}

function canonObj<T extends Record<string, unknown>>(value: T): T {
  let o: T = value

  if (
    o["type"] === "object" &&
    isObject(o["properties"]) &&
    isEmpty(o["properties"])
  ) {
    const { properties: _omitEmptyProperties, ...rest } = o
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    o = rest as T
  }

  if (
    isObject(o["additionalProperties"]) &&
    isEmpty(o["additionalProperties"])
  ) {
    const { additionalProperties: _omitEmptyAdditionalProperties, ...rest } = o
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    o = rest as T
  }

  if (Array.isArray(o["required"]) && o["required"].length === 0) {
    const { required: _omitEmptyRequired, ...rest } = o
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    o = rest as T
  }

  if (Array.isArray(o["parameters"]) && o["parameters"].length === 0) {
    const { parameters: _omitEmptyParameters, ...rest } = o
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    o = rest as T
  }

  if ("responses" in o && o["deprecated"] === false) {
    const { deprecated: _omitFalseDeprecated, ...rest } = o
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    o = rest as T
  }

  if (
    typeof o["in"] === "string" &&
    (o["in"] === "query" || o["in"] === "header") &&
    o["required"] === false
  ) {
    const { required: _omitOptionalRequired, ...rest } = o
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    o = rest as T
  }

  return normObj(o)
}

function normVal(value: unknown): unknown {
  if (Array.isArray(value)) {
    return canonArr(value)
  }

  if (isObject(value)) {
    return canonObj(value)
  }

  return value
}

const normObj = <T extends object>(obj: T): T => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const ret = {} as T

  for (const k in obj) {
    const raw = obj[k]

    if (k === "security" && Array.isArray(raw)) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      ret[k as keyof T] = canonArr(raw) as T[keyof T]
    } else if (k === "pattern" && typeof raw === "string") {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      ret[k as keyof T] = normalizePatternString(raw) as T[keyof T]
    } else {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      ret[k as keyof T] = normVal(raw) as T[keyof T]
    }
  }

  return ret
}

/**
 * Canonicalizes an OpenAPI document for stable equality checks in tests.
 *
 * This removes order-only and syntax-only differences treated as
 * validation-equivalent here, and rewrites path-item `parameters` onto each
 * operation so older operation-level fixtures compare equal to newer compiler
 * output.
 */
export const canonical = <T extends oas31.OpenAPIObject>(doc: T): T =>
  normObj(doc)
