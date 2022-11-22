import {
  isKey,
  isOptional,
  isSchema,
  NumFormat,
  Optional,
  RSchema,
  RStruct,
  RuntimeType,
  schemaGet,
  SchemaOrRef,
} from "../core/schema"
import { CoreTypeRefs } from "../core/core"

const numberTypes: Record<NumFormat, Capitalize<string>> = {
  int32: "Int",
  int64: "Long",
  float: "Float",
  double: "Double",
}

const runtimeTypes: Record<RuntimeType, KotlinClassName> = {
  httpURL: "responsible.kotlin.HttpURL",
  nat32: "UInt",
  nat64: "ULong",
  email: "responsible.kotlin.Email",
  hostname: "responsible.kotlin.Hostname",
  mime: "responsible.kotlin.Mime",
  seconds: "responsible.kotlin.Seconds",
  utcMillis: "responsible.kotlin.UtcMillis",
}

const schemaKotlinName = (
  x: RSchema,
  what: "type" | "class",
): KotlinType | KotlinClassName => {
  switch (x.type) {
    case "string":
      return "String"

    case "unknown":
      return what === "type" ? "Any?" : "Any"

    case "number":
      return x.format ? numberTypes[x.format] : "Double"

    case "runtime-library":
      return runtimeTypes[x.name]

    case "object":
      throw new Error(JSON.stringify(x))

    case "boolean": {
      throw new Error('Not implemented yet: "boolean" case')
    }
    case "array": {
      throw new Error('Not implemented yet: "array" case')
    }
    case "union": {
      throw new Error('Not implemented yet: "union" case')
    }
    case "newtype": {
      throw new Error('Not implemented yet: "newtype" case')
    }
    case "external": {
      throw new Error('Not implemented yet: "external" case')
    }
    case "dict": {
      throw new Error('Not implemented yet: "dict" case')
    }
  }
}

const isAlreadyOptional = (s: string): s is `${string}?` => s.endsWith("?")

export type KotlinType = string | `${string}?`
type KotlinClassName = string

export const typeGenerics = (
  refs: CoreTypeRefs,
  sor: SchemaOrRef,
): Set<string> => {
  const schema = schemaGet(refs, sor)

  switch (schema.type) {
    // case "external": {
    //   return isKey(refs, sor) ? new Set([sor]) : new Set()
    // }

    case "object": {
      return new Set(
        Object.values(schema.fields).flatMap(fieldSchema =>
          isKey(refs, fieldSchema) && refs[fieldSchema].type === "external"
            ? [fieldSchema]
            : [],
        ),
      )
    }

    default:
      return new Set()
  }
}

type RenderedGenerics = "" | `<${string}>`

const render = (generics: Set<string>): RenderedGenerics =>
  generics.size ? `<${[...generics].join(", ")}>` : ""

const renderGenerics = (refs: CoreTypeRefs, ref: string): RenderedGenerics =>
  render(typeGenerics(refs, ref))

const refTypeNameWithGenerics = (refs: CoreTypeRefs, ref: string) =>
  `${String(ref)}${renderGenerics(refs, ref)}` as const

/**
 * TODO should show generics
 */
export const kotlinTypeName = (
  refs: CoreTypeRefs,
  x: SchemaOrRef | Optional,
): KotlinType => {
  if (isOptional(x)) {
    const name = kotlinTypeName(refs, x.schema)
    const questionSuffix = isAlreadyOptional(name) ? "" : "?"
    return `${name}${questionSuffix}` as const
  }

  if (isKey(refs, x)) {
    return refTypeNameWithGenerics(refs, x)
  }

  if (isSchema(x)) {
    return schemaKotlinName(x, "type")
  }

  throw new Error(JSON.stringify(x))
}

export const kotlinClassName = (x: SchemaOrRef | Optional): string => {
  if (isSchema(x)) {
    return schemaKotlinName(x, "class")
  }

  if (isOptional(x)) {
    return kotlinClassName(x.schema)
  }

  return String(x)
}

const declareDataclass = (refs: CoreTypeRefs, refName: string): string => {
  const nameWithGenerics = refTypeNameWithGenerics(refs, refName)

  const o = refs[refName] as RStruct
  const fields = Object.entries(o.fields)
    .map(([fieldName, schema]) => {
      const tpe = kotlinTypeName(refs, schema)
      if (!tpe) throw new Error(JSON.stringify(schema))

      return `val ${fieldName}: ${tpe}`
    })
    .join(",\n")

  return `data class ${nameWithGenerics}(\n${fields}\n)\n`
}

const declareType = (refs: CoreTypeRefs, name: string): string => {
  const ref = refs[name]
  switch (ref.type) {
    case "newtype": {
      const tpe = kotlinTypeName(refs, ref.schema)
      if (!tpe) throw new Error(JSON.stringify(ref))

      return `@JvmInline value class ${name}(val value: ${tpe})\n`
    }

    case "external":
      return ""

    case "object":
      return declareDataclass(refs, name)

    case "string": {
      if (ref.enum?.length) {
        return `enum class ${name} {\n${ref.enum.join(",\n")}\n}\n`
      } else {
        throw new Error(JSON.stringify(ref))
      }
    }

    default:
      throw new Error(ref.type)
  }
}

export const genKotlinTypes = (refs: CoreTypeRefs): string =>
  Object.keys(refs)
    .map(k => declareType(refs, k))
    .filter(x => x)
    .join("\n")
