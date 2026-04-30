import { Validator } from "@seriousme/openapi-schema-validator"
import type { oas31 } from "openapi3-ts"

const VALIDATOR = new Validator()

function assertValid(
  doc: Partial<oas31.OpenAPIObject>,
  v: Awaited<ReturnType<typeof VALIDATOR.validate>>,
): asserts doc is oas31.OpenAPIObject {
  if (!v.valid) {
    throw new Error(JSON.stringify(v.errors, null, 2))
  }
}

/** Returns {@link oas31.OpenAPIObject} to be passed to expect() */
export async function validateDoc(
  doc: Partial<oas31.OpenAPIObject> | Record<string, unknown>,
): Promise<oas31.OpenAPIObject> {
  const vld = await VALIDATOR.validate(doc)

  assertValid(doc, vld)

  return doc
}
