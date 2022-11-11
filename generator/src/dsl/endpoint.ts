import { mergeOpts } from "../core/endpoint"

export const flattenScopes = (init: Scope): ReadonlyArray<TraversedPath> => {
  const ret = Array<TraversedPath>()

  const stack: Array<[`/${string}`, Scope]> = [["" as `/${string}`, init]]

  while (stack.length) {
    const item = stack.pop()
    if (!item) break

    const [path, s] = item
    for (const k in s.endpoints) {
      const mergedPath = `${path}${k}` as const

      const e = s.endpoints[k as keyof Endpoints]
      if (isScope(e)) {
        stack.push([
          mergedPath,
          { endpoints: e.endpoints, opts: mergeOpts(s.opts, e.opts) },
        ])
      } else {
        ret.push([s.opts ?? {}, mergedPath, e])
      }
    }
  }

  return ret
}
