export type Assert<T extends true> = T

/** `One` extends `Two` */
export type OneExtendsTwo<One, Two> = [One] extends [Two] ? true : false

/*
 * This compares types by checking whether they behave identically across all
 * possible generic inputs, which avoids conflating subtype checks with exact
 * equality.
 */
export type IsEqual<One, Two> =
  (<T>(value?: T) => T extends One ? 1 : 2) extends <T>(
    value?: T,
  ) => T extends Two ? 1 : 2
    ? (<T>(value?: T) => T extends Two ? 1 : 2) extends <T>(
        value?: T,
      ) => T extends One ? 1 : 2
      ? true
      : false
    : false

/*
 * This is useful for compile-time assertions that a rejected type-level branch
 * collapsed to `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false
