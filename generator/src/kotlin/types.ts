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
import { CoreService, CoreTypeRefs } from "../core/core"

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
  refs: CoreTypeRefs,
  path: ReadonlyArray<string>,
  what: "type" | "class",
  x: RSchema,
): KotlinType | KotlinClassName => {
  switch (x.type) {
    case "boolean":
      return "Boolean"

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

    case "array":
      return what === "type"
        ? `List<${kotlinTypeName(refs, [...path, "items"], x.items)}>`
        : "List"

    case "union": {
      throw new Error('Not implemented yet: "union" case')
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
  path: ReadonlyArray<string>,
  x: SchemaOrRef | Optional,
): KotlinType => {
  if (isOptional(x)) {
    const name = kotlinTypeName(refs, path, x.schema)
    const questionSuffix = isAlreadyOptional(name) ? "" : "?"
    return `${name}${questionSuffix}` as const
  }

  if (isKey(refs, x)) {
    return refTypeNameWithGenerics(refs, x)
  }

  if (isSchema(x)) {
    return schemaKotlinName(refs, path, "type", x)
  }

  throw new Error(JSON.stringify(x))
}

export const kotlinClassName = (
  refs: CoreTypeRefs,
  path: ReadonlyArray<string>,
  x: SchemaOrRef | Optional,
): string => {
  if (isOptional(x)) {
    return kotlinClassName(refs, path, x.schema)
  }

  if (isSchema(x)) {
    return schemaKotlinName(refs, path, "class", x)
  }

  return String(x)
}

const declareDataclass = (
  refs: CoreTypeRefs,
  path: ReadonlyArray<string>,
  refName: string,
): string => {
  const nameWithGenerics = refTypeNameWithGenerics(refs, refName)

  const o = refs[refName] as RStruct
  const fields = Object.entries(o.fields)
    .map(([fieldName, schema]) => {
      const tpe = kotlinTypeName(refs, [...path, fieldName], schema)
      if (!tpe) throw new Error(JSON.stringify(schema))

      return `val ${fieldName}: ${tpe}`
    })
    .join(",\n")

  return `data class ${nameWithGenerics}(\n${fields}\n)\n`
}

const declareType = (
  refs: CoreTypeRefs,
  path: ReadonlyArray<string>,
  name: string,
): string => {
  const ref = refs[name]
  switch (ref.type) {
    case "external":
      return ""

    case "object":
      return declareDataclass(refs, path, name)

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

export const genKotlinTypes = ({ refs }: CoreService): string => {
  return Object.keys(refs)
    .map(k => declareType(refs, [k], k))
    .filter(x => x)
    .join("\n")
}
