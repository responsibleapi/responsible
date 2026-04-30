export const typesafeLowercase = <S extends string>(s: S): Lowercase<S> =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  s.toLowerCase() as Lowercase<S>

/** Requires at least 1 key in an object */
export type AtLeastOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>
}[keyof T]

/** Requires at least 2 keys in an object */
export type AtLeastTwo<T> = {
  [K1 in keyof T]: {
    [K2 in Exclude<keyof T, K1>]: Required<Pick<T, K1 | K2>> &
      Partial<Omit<T, K1 | K2>>
  }[Exclude<keyof T, K1>]
}[keyof T]
