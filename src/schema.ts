interface Field {
  schema: Schema
  optional?: boolean
}

export type Schema =
  | {
      kind: "primitive"
      name: string
    }
  | {
      kind: "newtype"
      name: string
      extends: Schema
    }
  | {
      kind: "object"
      name: string
      fields: Record<string, Field>
    }
  | {
      kind: "array"
      name: string
      type: Schema
    }

const string = (): Schema => ({
  kind: "primitive",
  name: "string",
})

const uuid = (): Schema => ({
  kind: "primitive",
  name: "uuid",
})

const newString = (name: string): Schema => ({
  kind: "newtype",
  name,
  extends: string(),
})

const object = (name: string, fields: Record<string, Field>): Schema => ({
  kind: "object",
  name,
  fields,
})
