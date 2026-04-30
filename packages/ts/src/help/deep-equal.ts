import fastDeepEqual from "fast-deep-equal"

export const deepEqual: (a: unknown, b: unknown) => boolean = fastDeepEqual
