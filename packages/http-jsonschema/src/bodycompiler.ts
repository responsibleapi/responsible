import type { oas31 } from "openapi3-ts"
import { unionSchema, type TypedSchema, type UnionSchema } from "./typedschema"

const escapeRegex = (s: string): string =>
  s.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&")

const stringStartsWith = (s: string): TypedSchema<string> => ({
  type: "string",
  pattern: `^${escapeRegex(s)}`,
})

export interface MetaBody {
  mime: string
  body: unknown
}

export const contentToSchema = (
  mimes: Record<string, oas31.MediaTypeObject>,
): UnionSchema<MetaBody> => {
  const oneOf = Array<TypedSchema<MetaBody>>()

  for (const mime in mimes) {
    const body = mimes[mime].schema
    if (!body) continue

    oneOf.push({
      type: "object",
      properties: {
        mime: stringStartsWith(mime),
        body,
      },
      required: ["mime", "body"],
    })
  }

  return unionSchema(oneOf)
}
