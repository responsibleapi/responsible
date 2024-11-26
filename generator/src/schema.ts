import type kdljs from "kdljs"
import type { oas31 } from "openapi3-ts"
import { removeAbsent } from "./typescript"

export type SchemaOrRef = oas31.SchemaObject | oas31.ReferenceObject

const TAG_OPTIONAL = "?"

export const isRequired = (node: kdljs.Node): boolean =>
  node.tags.name !== TAG_OPTIONAL

export const isValueOptional = (node: kdljs.Node, idx: number): boolean =>
  node.tags.values[idx] === TAG_OPTIONAL

export const toEnum = (node: kdljs.Node): oas31.SchemaObject => ({
  ...node.properties,
  type: "string",
  enum: node.children.map(x => x.name),
})

export const parseStruct = (node: kdljs.Node): oas31.SchemaObject => {
  const { extends: extendz, ...rest } = node.properties

  const schema: oas31.SchemaObject = removeAbsent({
    ...rest,
    type: "object",
    properties: Object.fromEntries(
      node.children.map(x => [x.name, parseSchemaOrRef(x)]),
    ),
    required: node.children.flatMap(x => (isRequired(x) ? [x.name] : [])),
  })

  if (typeof extendz === "string") {
    const extendsArr = extendz.split(",").map(x => x.trim())
    return {
      allOf: [
        ...extendsArr.map(x => ({ $ref: `#/components/schemas/${x.trim()}` })),
        schema,
      ],
    }
  } else {
    return schema
  }
}

export const typeName = (n: kdljs.Node): string => {
  if (!n.values.length) return n.name

  if (n.values.length >= 3 && n.values[n.values.length - 3] === "dict") {
    return "dict"
  }

  if (n.values.length >= 2 && n.values[n.values.length - 2] === "array") {
    return "array"
  }

  const last = n.values[n.values.length - 1]
  if (typeof last !== "string") throw new Error(JSON.stringify(n))

  return last
}

const toNode = (name: string): kdljs.Node => ({
  name,
  values: [],
  properties: {},
  children: [],
  tags: { name: "", values: [], properties: {} },
})

const strToSchema = (name: string): SchemaOrRef =>
  parseSchemaOrRef(toNode(name))

function enumArr(enm: kdljs.Value): kdljs.Value[] | undefined {
  switch (typeof enm) {
    case "string":
      return enm.split(",").map(x => x.trim())

    case "undefined":
      return undefined

    default:
      return [enm]
  }
}

export const parseSchemaOrRef = (
  node: kdljs.Node,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const typName = typeName(node)

  switch (typName) {
    case "oneOf":
      return { oneOf: node.children.map(parseSchemaOrRef) }

    case "unknown":
      return {}

    case "enum":
      return toEnum(node)

    case "struct":
      return parseStruct(node)

    case "dateTime": {
      return {
        ...node.properties,
        type: "string",
        format: "date-time",
      }
    }

    case "string": {
      const parsedLen = Number(node.properties.length)
      const length = isNaN(parsedLen) ? undefined : parsedLen
      return removeAbsent({
        minLength: length,
        maxLength: length,
        ...node.properties,
        length: undefined,
        type: "string",
        enum: enumArr(node.properties.enum),
      } satisfies oas31.SchemaObject & { length?: undefined })
    }

    case "boolean":
      return { ...node.properties, type: "boolean" }

    case "int32":
    case "int64":
      return { ...node.properties, type: "integer", format: typName }

    case "dict": {
      if (
        typeof node.values[1] !== "string" ||
        typeof node.values[2] !== "string"
      ) {
        throw new Error(JSON.stringify(node))
      }

      return removeAbsent({
        ...node.properties,
        type: "object",
        propertyNames:
          node.values[1] === "string" ? undefined : strToSchema(node.values[1]),
        additionalProperties: strToSchema(node.values[2]),
      })
    }

    case "array": {
      const last = node.values[node.values.length - 1]
      if (typeof last === "string" && last !== "array") {
        return {
          ...node.properties,
          type: "array",
          items: strToSchema(last),
        }
      } else if (node.children.length === 1) {
        return {
          ...node.properties,
          type: "array",
          items: parseSchemaOrRef(node.children[0]),
        }
      } else {
        throw new Error(JSON.stringify(node))
      }
    }

    case "binary":
      return { type: "string", format: "binary" }

    case "mime":
      return { type: "string", pattern: "^[a-z]+/.+$" }

    case "httpURL":
      return { type: "string", format: "uri", pattern: "^https?:\\/\\/\\S+$" }

    case "nat32":
      return {
        type: "integer",
        format: "int32",
        minimum: 0,
        ...node.properties,
      }

    case "nat64":
      return {
        type: "integer",
        format: "int64",
        minimum: 0,
        ...node.properties,
      }

    case "email":
      return { type: "string", format: "email" }

    case "hostname":
      return { type: "string", format: "hostname" }

    case "seconds":
      // TODO maybe format=seconds?
      return { type: "integer", format: "int64" }

    case "utcMillis":
      // TODO maybe format=millis?
      return { type: "integer", format: "int64" }

    default:
      return { $ref: `#/components/schemas/${typName}` }
  }
}
