import type { oas31 } from "openapi3-ts"

type NumberSchema =
  | {
      type: "number"
      format?: "float" | "double"
    }
  | {
      type: "integer"
      format?: "int32" | "int64"
    }

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type StringSchema = {
  type: "string"
  format?:
    | "date"
    | "date-time"
    | "duration"
    | "email"
    | "hostname"
    | "password"
    | "time"
    | "uri"
  pattern?: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type BigIntSchema = {
  type: "integer"
  format: "int64"
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ObjectSchema<T extends object> = {
  type: "object"
  properties: {
    [K in keyof T]: oas31.SchemaObject | oas31.ReferenceObject
  }
  required?: Array<keyof T>
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ArraySchema<Item> = {
  type: "array"
  items: UnionSchema<Item> | oas31.ReferenceObject
}

export type TypedSchema<T> = T extends bigint
  ? BigIntSchema
  : T extends number
    ? NumberSchema
    : T extends string
      ? StringSchema
      : T extends Array<infer Item>
        ? ArraySchema<Item>
        : T extends object
          ? ObjectSchema<T>
          : never

export type UnionSchema<T> =
  | TypedSchema<T>
  | { oneOf: Array<TypedSchema<T> | oas31.ReferenceObject> }
  | Record<PropertyKey, never>

export function unionSchema<T>(oneOf: TypedSchema<T>[]): UnionSchema<T> {
  switch (oneOf.length) {
    case 0:
      return {}

    case 1:
      return oneOf[0]

    default:
      return { oneOf }
  }
}
