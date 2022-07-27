import { RObject } from "../core/endpoint"
import { RefsRec } from "../core/core"

/**
 * generates python dataclass from fields
 */

const toDataclass = <Refs extends RefsRec>(
  refs: Refs,
  name: keyof Refs,
): string => {
  const o = refs[name] as RObject<Refs>
  const fields = Object.entries(o.fields)
    .map(([name, schema]) => {
      const type = toPythonType(refs, name)
      return `${name}: ${type}`
    })
    .join(",\n")
  return `class ${String(name)}:\n${fields}`
}

const toPythonType = <Refs extends RefsRec>(
  refs: Refs,
  name: keyof Refs,
): string => {}

export const pythonTypes = <Refs extends RefsRec>(refs: Refs): string => {}
