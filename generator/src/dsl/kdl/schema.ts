import { OpenAPIV3 } from "openapi-types"
import { kdljs } from "kdljs"

export type SchemaOrRef = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject

const TAG_OPTIONAL = "?"

export const isOptional = (node: kdljs.Node): boolean =>
  node.tags.name === TAG_OPTIONAL

const toEnum = (node: kdljs.Node): OpenAPIV3.NonArraySchemaObject => ({
  type: "string",
  enum: node.children.map(x => x.name),
})

const toStruct = (node: kdljs.Node): OpenAPIV3.NonArraySchemaObject => ({
  type: "object",
  properties: Object.fromEntries(
    node.children.map(x => [x.name, parseSchemaOrRef(x)]),
  ),
  required: node.children.flatMap(x => (isOptional(x) ? [x.name] : [])),
})

const typeName = (n: kdljs.Node): string => {
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

const nodeToSchema = (node: kdljs.Node): OpenAPIV3.SchemaObject | undefined => {
  const typName = typeName(node)

  switch (typName) {
    case "unknown":
      return { nullable: true }

    case "enum":
      return toEnum(node)

    case "struct":
      return toStruct(node)

    case "dateTime": {
      return <OpenAPIV3.NonArraySchemaObject>{
        ...node.properties,
        type: "string",
        format: "date-time",
      }
    }

    case "string": {
      const parsed = parseInt(String(node.properties.length))
      const length = isNaN(parsed) ? undefined : parsed

      return {
        minLength: length,
        maxLength: length,
        ...node.properties,
        type: "string",
      }
    }

    case "boolean":
      return { ...node.properties, type: "boolean" }

    case "int32":
    case "int64":
      return { ...node.properties, type: "integer", format: typName }

    case "dict": {
      if (
        typeof node.values[1] === "string" &&
        typeof node.values[2] === "string"
      ) {
        if (typeName(toNode(node.values[1])) !== "string") {
          throw new Error("only string keys are supported")
        }

        return {
          ...node.properties,
          type: "object",
          additionalProperties: strToSchema(node.values[2]),
        }
      } else {
        throw new Error(JSON.stringify(node))
      }
    }

    case "array": {
      const last = node.values[node.values.length - 1]
      if (typeof last === "string" && last !== "array") {
        return <OpenAPIV3.ArraySchemaObject>{
          ...node.properties,
          type: "array",
          items: strToSchema(last),
        }
      } else if (node.children.length === 1) {
        return <OpenAPIV3.ArraySchemaObject>{
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
      return undefined
  }
}

export const parseSchemaOrRef = (n: kdljs.Node): SchemaOrRef =>
  nodeToSchema(n) ?? { $ref: `#/components/schemas/${typeName(n)}` }
