export const isObject = (o: unknown): o is object =>
  o !== null && typeof o === "object"

export const isEmpty = (o: object): o is Record<string, never> =>
  Object.keys(o).length === 0

export const checkNonNull = <T>(t: T | null | undefined): NonNullable<T> => {
  if (t === null || t === undefined) throw new Error(String(t))

  return t
}

const isAbsent = (
  v: unknown,
): v is null | undefined | "" | Array<never> | Record<string, never> =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (isObject(v) && isEmpty(v))

/** OpenAPI does not allow nulls, empty arrays and objects */
export const removeAbsent = <T extends object>(t: T): T => {
  for (const k in t) {
    if (isAbsent(t[k])) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete t[k]
    }
  }
  return t
}

export const capitalize = <T extends string>(s: T): Capitalize<T> | "" =>
  (s ? `${s[0].toUpperCase()}${s.slice(1)}` : "") as Capitalize<T>

export function mapValues<T extends object>(
  obj: T,
  fn: (v: T[keyof T]) => T[keyof T],
): T {
  const ret = {} as T
  for (const k in obj) {
    ret[k as keyof T] = fn(obj[k])
  }
  return ret
}
