import {
  isOptional,
  isRef,
  isSchema,
  Optional,
  RObject,
  RSchema,
  SchemaOrRef,
} from "../core/endpoint"
import { RefsRec } from "../core/core"

const schemaTypeName = <Refs extends RefsRec>(
  x: RSchema<Refs>,
): string | `Any?` => {
  switch (x.type) {
    case "string":
      return "String"

    case "unknown":
      return "Any?"

    case "number": {
      switch (x.format) {
        case "float":
          return "Float"

        case "double":
          return "Double"

        case "int32":
          return "Int"

        case "int64":
          return "Long"
      }
      return "Double"
    }

    case "object":
      throw new Error(JSON.stringify(x))

    default:
      throw new Error(x.type)
  }
}

const isAlreadyOptional = (s: string): s is `${string}?` => s.endsWith("?")

export type KotlinType = string | `${string}?`

export const typeNameKotlin = <Refs extends RefsRec>(
  x: SchemaOrRef<Refs> | Optional<Refs>,
): KotlinType => {
  if (isSchema(x)) {
    return schemaTypeName(x)
  }

  if (isOptional(x)) {
    const name = typeNameKotlin(x.schema)
    const questionSuffix = isAlreadyOptional(name) ? "" : "?"
    return `${name}${questionSuffix}` as const
  }

  return String(x)
}

const declareDataclass = <Refs extends RefsRec>(
  refs: Refs,
  refName: keyof Refs,
): string => {
  const o = refs[refName] as RObject<Refs>

  const genericNames = Object.values(o.fields).flatMap(field =>
    isRef(field) && refs[field].type === "external" ? [field] : [],
  )

  const generics = genericNames.length
    ? (`<${genericNames.join(", ")}>` as const)
    : ""

  const fields = Object.entries(o.fields)
    .map(([fieldName, schema]) => `${fieldName}: ${typeNameKotlin(schema)}`)
    .join(",\n")

  return `data class ${String(refName)}${generics}(\n${fields}\n)\n`
}

const declareType = <Refs extends RefsRec>(
  refs: Refs,
  name: keyof Refs,
): string => {
  switch (refs[name].type) {
    case "external":
      return ""

    case "object":
      return declareDataclass(refs, name)

    default:
      throw new Error("")
  }
}

export const genKotlinTypes = <Refs extends RefsRec>(refs: Refs): string =>
  Object.keys(refs)
    .map(k => declareType(refs, k))
    .filter(x => x)
    .join("\n")
