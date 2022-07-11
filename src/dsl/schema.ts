interface RObject<K extends string = string> {
  type: "object"
  properties: Record<K, Schema>
  required?: K[]
}

export type PrimitiveSchema =
  | {
      type: "string"
      format?:
        | "email"
        | "date"
        | "date-time"
        | "password"
        | "uri"
        | "hostname"
        | "uuid"
        | "ipv4"
        | "ipv6"
        | "byte"
        | "binary"
      minLength?: number
      maxLength?: number
      pattern?: RegExp

      /**
       * TODO how do we verify
       */
      template?: string
    }
  | {
      type: "number"
      format?: "int32" | "int64" | "float" | "double"
      minimum?: number
      maximum?: number
    }
  | { type: "boolean" }

type Schema =
  | PrimitiveSchema
  | { type: "array"; items: Schema }
  | RObject
  | { type: "union"; oneOf: Schema[] }

interface Named {
  kind: "alias" | "newtype"
  name: string
  underlying: Schema
}

interface External {
  kind: "external"
  name: string
}

export interface PrimitiveOptionality {
  optional: boolean
  schema: PrimitiveSchema
}

interface Optionality {
  optional: boolean
  schema: Schema | Named | External
}

const string = (opts?: {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
}): Schema => ({ type: "string", ...opts })

const uuid = (): Schema => ({ type: "string", format: "uuid" })

const newType = (name: string, underlying: Schema | Named): Named => ({
  kind: "newtype",
  name,
  underlying: "type" in underlying ? underlying : underlying.underlying,
})

const external = (name: string): External => ({ kind: "external", name })

export type TheType = Schema | Named | External

const struct = (
  fields: Record<string, Schema | Optionality | Named | External>,
): Schema => {
  const required = Array<string>()
  const properties = {} as Record<string, Schema>

  for (const k in fields) {
    const x = fields[k]
    properties[k] = "optional" in x ? x.schema : x
    if (!("optional" in x) || !x.optional) {
      required.push(k)
    }
  }

  return { type: "object", required, properties }
}
