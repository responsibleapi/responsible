import {
  isKey,
  isOptional,
  isSchema,
  Optional,
  RSchema,
  RStruct,
  SchemaOrRef,
} from "../core/RSchema"
import { CoreTypeRefs } from "../core/core"

const schemaKotlinName = (
  x: RSchema,
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

        case undefined:
          return "Double"
      }
      break
    }

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
    case "runtime-library": {
      throw new Error('Not implemented yet: "runtime-library" case')
    }
  }
}

const isAlreadyOptional = (s: string): s is `${string}?` => s.endsWith("?")

export type KotlinType = string | `${string}?`
type KotlinClassName = string

export const typeGenerics = (
  refs: CoreTypeRefs,
  refName: string,
): Set<string> => {
  const schema = refs[refName]
  switch (schema.type) {
    case "object": {
      return new Set(
        Object.values(schema.fields).flatMap(field =>
          isKey(refs, field) && refs[field].type === "external" ? [field] : [],
        ),
      )
    }

    default:
      return new Set()
  }
}

type RenderedGenerics = "" | `<${string}>`

const renderGenerics = (refs: CoreTypeRefs, ref: string): RenderedGenerics => {
  const generics = typeGenerics(refs, ref)
  return generics.size ? `<${[...generics].join(", ")}>` : ""
}

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

      return `inline class ${name}(val value: ${tpe})\n`
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
