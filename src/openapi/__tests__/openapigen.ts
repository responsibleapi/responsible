import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"
import fc from "fast-check"

const oneOf = <T>(arr: ReadonlyArray<T>): fc.Arbitrary<T> =>
  fc.oneof(...arr.map(fc.constant))

const optional = <T>(a: fc.Arbitrary<T>): fc.Arbitrary<T | undefined> =>
  fc.option(a, { nil: undefined })

const arbStr = (): fc.Arbitrary<OpenAPIV3_1.NonArraySchemaObject> =>
  fc.record({
    type: fc.constant("string"),
    format: optional(
      oneOf([
        "email",
        "date",
        "date-time",
        "password",
        "uri",
        "hostname",
        "uuid",
        "ipv4",
        "ipv6",
        "byte",
        "binary",
      ]),
    ),
    minLength: optional(fc.nat()),
    maxLength: optional(fc.nat()),
    enum: optional(fc.array(fc.string())),
  })

const arbNum = (): fc.Arbitrary<OpenAPIV3_1.NonArraySchemaObject> =>
  fc.record({
    type: fc.constant("number"),
    format: optional(oneOf(["int32", "int64", "float", "double"])),
    minimum: optional(fc.double()),
    maximum: optional(fc.double()),
  })

const arbArr = (
  items: fc.Arbitrary<OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>,
): fc.Arbitrary<OpenAPIV3_1.ArraySchemaObject> =>
  fc.record({
    type: fc.constant("array"),
    items,
  })

const arbRef = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): fc.Arbitrary<OpenAPIV3_1.ReferenceObject> =>
  fc.record({
    $ref: oneOf(Object.keys(schemas)).map(
      k => `#/components/schemas/${k}` as const,
    ),
  })

const schemaOrRef = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
  items: fc.Arbitrary<OpenAPIV3_1.SchemaObject>,
): fc.Arbitrary<OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject> =>
  // @ts-ignore foo bar baz
  Object.keys(schemas).length ? fc.oneof(items, arbRef(schemas)) : items

const arbStruct = (
  items: fc.Arbitrary<OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>,
): fc.Arbitrary<OpenAPIV3_1.SchemaObject> =>
  fc.dictionary(nonEmptyStr(), items).chain(props => {
    const propsKs = Object.keys(props)
    return fc.record({
      type: fc.constant("object"),
      properties: fc.constant(props),
      required: propsKs.length
        ? optional(fc.array(oneOf(propsKs)))
        : fc.constant(undefined),
    })
  })

const arbSchema = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): fc.Arbitrary<OpenAPIV3_1.SchemaObject> =>
  fc.letrec<{ schema: OpenAPIV3_1.SchemaObject }>(tie => ({
    schema: fc.oneof(
      arbStr(),
      arbNum(),
      arbArr(schemaOrRef(schemas, tie("schema"))),
      arbStruct(schemaOrRef(schemas, tie("schema"))),
    ),
  })).schema

const arbPath = () =>
  fc.array(fc.webSegment()).map(a => `/${a.join("/")}` as const)

const arbMethod = (): fc.Arbitrary<OpenAPIV3_1.HttpMethods> =>
  oneOf(Object.values(OpenAPIV3.HttpMethods))

const arbParam = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): fc.Arbitrary<OpenAPIV3_1.ParameterObject> =>
  fc.record({
    name: nonEmptyStr(),
    in: oneOf(["header", "query", "path", "cookie"]),
    required: optional(fc.boolean()),
    schema: schemaOrRef(schemas, arbSchema(schemas)),
  })

const arbHeader = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): fc.Arbitrary<OpenAPIV3_1.HeaderObject> =>
  fc.record({
    required: optional(fc.boolean()),
    schema: schemaOrRef(schemas, arbSchema(schemas)),
  })

const nonEmptyStr = (): fc.Arbitrary<string> => fc.string({ minLength: 1 })

const arbResponse = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): fc.Arbitrary<OpenAPIV3_1.ResponseObject> =>
  fc.record({
    description: fc.string(),
    headers: optional(fc.dictionary(nonEmptyStr(), arbHeader(schemas))),
    content: fc.dictionary(
      nonEmptyStr(),
      fc.record({ schema: arbSchema(schemas) }),
    ),
  })

const arbOp = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): fc.Arbitrary<OpenAPIV3_1.OperationObject> =>
  fc.record({
    operationId: optional(nonEmptyStr()),
    parameters: optional(fc.array(arbParam(schemas))),
    responses: fc.dictionary(
      fc.integer({ min: 100, max: 599 }).map(String),
      arbResponse(schemas),
    ),
  })

export const arbOpenApiDoc = (): fc.Arbitrary<OpenAPIV3_1.Document> =>
  fc.dictionary(nonEmptyStr(), arbSchema({})).chain(schemas =>
    fc.record<OpenAPIV3_1.Document>({
      openapi: fc.constant("3.1.0"),
      info: fc.record({
        title: nonEmptyStr(),
        version: fc
          .tuple(fc.nat(), fc.nat())
          .map(([major, minor]) => `${major}.${minor}` as const),
      }),
      components: fc.record({
        schemas: fc.constant(schemas),
      }),
      paths: fc.dictionary(
        arbPath(),
        fc.dictionary(arbMethod(), arbOp(schemas)),
      ),
    }),
  )
