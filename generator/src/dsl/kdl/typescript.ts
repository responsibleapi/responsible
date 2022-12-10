import { deepmergeCustom } from "deepmerge-ts"

export const isEmpty = (
  o: Record<string, unknown>,
): o is Record<string, never> => Object.keys(o).length === 0

export const checkNonNull = <T>(t: T | null | undefined): NonNullable<T> => {
  if (t === null || t === undefined) throw new Error(String(t))

  return t
}

export const myDeepmerge = deepmergeCustom({
  mergeOthers: (values, utils) =>
    utils.defaultMergeFunctions.mergeOthers(
      values.filter(v => v !== undefined),
      // @ts-ignore foo bar baz
      utils,
    ),
})
