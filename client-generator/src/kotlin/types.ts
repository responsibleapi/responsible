import {
  isOptional,
  isKey,
  isSchema,
  Optional,
  RObject,
  RSchema,
  SchemaOrRef,
} from "../core/endpoint"
import { RefsRec } from "../core/core"

const schemaKotlinName = <Refs extends RefsRec>(
  x: RSchema<Refs>,
  what: "type" | "class",
): KotlinType | KotlinClassName => {
  switch (x.type) {
    case "string":
      return "String"

    case "unknown":
      return what === "type" ? "Any?" : "Any"

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
type KotlinClassName = string

const refTypeNameWithGenerics = <Refs extends RefsRec>(
  refs: Refs,
  refName: keyof Refs,
) => {
  const schema = refs[refName]
  const theName = String(refName)

  if (schema.type === "object") {
    const genericNames = Object.values(schema.fields).flatMap(field =>
      isKey(refs, field) && refs[field].type === "external" ? [field] : [],
    )

    const generics = genericNames.length
      ? (`<${genericNames.join(", ")}>` as const)
      : ""

    return `${theName}${generics}`
  } else {
    return theName
  }
}

/**
 * TODO should show generics
 */
export const kotlinTypeName = <Refs extends RefsRec>(
  refs: Refs,
  x: SchemaOrRef<Refs> | Optional<Refs>,
): KotlinType => {
  if (isSchema(x)) {
    return schemaKotlinName(x, "type")
  }

  if (isOptional(x)) {
    const name = kotlinTypeName(refs, x.schema)
    const questionSuffix = isAlreadyOptional(name) ? "" : "?"
    return `${name}${questionSuffix}` as const
  }

  if (isKey(refs, x)) {
    return refTypeNameWithGenerics(refs, x)
  }

  throw new Error(JSON.stringify(x))
}

export const kotlinClassName = <Refs extends RefsRec>(
  x: SchemaOrRef<Refs> | Optional<Refs>,
): string => {
  if (isSchema(x)) {
    return schemaKotlinName(x, "class")
  }

  if (isOptional(x)) {
    return kotlinClassName(x.schema)
  }

  return String(x)
}

const declareDataclass = <Refs extends RefsRec>(
  refs: Refs,
  refName: keyof Refs,
): string => {
  const nameWithGenerics = refTypeNameWithGenerics(refs, refName)

  const o = refs[refName] as RObject<Refs>
  const fields = Object.entries(o.fields)
    .map(
      ([fieldName, schema]) =>
        `val ${fieldName}: ${kotlinTypeName(refs, schema)}`,
    )
    .join(",\n")

  return `data class ${nameWithGenerics}(\n${fields}\n)\n`
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
