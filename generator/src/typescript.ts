export const isEmpty = (
  o: Record<string, unknown>,
): o is Record<string, never> => Object.keys(o).length === 0

export const checkNonNull = <T>(t: T | null | undefined): NonNullable<T> => {
  if (t === null || t === undefined) throw new Error(String(t))

  return t
}

export const noUndef = <T extends Record<string, unknown>>(t: T): T => {
  for (const k in t) {
    if (t[k] === undefined) {
      delete t[k]
    }
  }
  return t
}
