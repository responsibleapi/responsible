import { compareParams } from "../to-open-api"
import { OpenAPIV3 } from "openapi-types"
import fc from "fast-check"

const oneOf = <T>(arr: ReadonlyArray<T>): fc.Arbitrary<T> =>
  fc.oneof(...arr.map(fc.constant))

const optional = <T>(a: fc.Arbitrary<T>): fc.Arbitrary<T | undefined> =>
  fc.option(a, { nil: undefined })

const arbStr = (): fc.Arbitrary<OpenAPIV3.NonArraySchemaObject> =>
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
    enum: optional(distinctArray(fc.string())),
  })

const arbNum = (): fc.Arbitrary<OpenAPIV3.NonArraySchemaObject> =>
  fc.record({
    type: fc.constant("number"),
    format: optional(oneOf(["int32", "int64", "float", "double"])),
    minimum: optional(fc.double()),
    maximum: optional(fc.double()),
  })

const arbArr = (
  items: fc.Arbitrary<OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>,
): fc.Arbitrary<OpenAPIV3.ArraySchemaObject> =>
  fc.record({
    type: fc.constant("array"),
    items,
  })

const arbRef = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.ReferenceObject> =>
  fc.record({
    $ref: oneOf(Object.keys(schemas)).map(
      k => `#/components/schemas/${k}` as const,
    ),
  })

const schemaOrRef = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
  items: fc.Arbitrary<OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> =>
  // @ts-ignore foo bar baz
  Object.keys(schemas).length ? fc.oneof(items, arbRef(schemas)) : items

const distinctArray = <T>(arb: fc.Arbitrary<T>): fc.Arbitrary<Array<T>> =>
  fc.array(arb).map(arr => {
    const arr2 = [...new Set(arr)]
    arr2.sort()
    return arr2
  })

const arbStruct = (
  items: fc.Arbitrary<OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>,
): fc.Arbitrary<OpenAPIV3.SchemaObject> =>
  fc.dictionary(nonEmptyStr(), items, { minKeys: 1 }).chain(props => {
    const propsKs = Object.keys(props)
    return fc.record({
      type: fc.constant("object"),
      properties: fc.constant(props),
      required: propsKs.length
        ? distinctArray(oneOf(propsKs))
        : fc.constant([]),
    })
  })

const arbUnknown = (): fc.Arbitrary<OpenAPIV3.NonArraySchemaObject> =>
  fc.constant({ nullable: true })

const arbSchema = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.SchemaObject> =>
  fc.letrec<{ schema: OpenAPIV3.SchemaObject }>(tie => ({
    schema: fc.oneof(
      arbUnknown(),
      arbStr(),
      arbNum(),
      arbArr(schemaOrRef(schemas, tie("schema"))),
      arbStruct(schemaOrRef(schemas, tie("schema"))),
    ),
  })).schema

const arbPath = () =>
  fc.array(fc.webSegment()).map(a => `/${a.join("/")}` as const)

const arbMethod = (): fc.Arbitrary<OpenAPIV3.HttpMethods> =>
  oneOf(Object.values(OpenAPIV3.HttpMethods))

const arbOptParam = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.ParameterObject> =>
  fc.record({
    name: nonEmptyStr(),
    in: oneOf(["header", "query", "cookie"]),
    required: oneOf([true, undefined]),
    schema: schemaOrRef(schemas, arbSchema(schemas)),
  })

const arbPathParam = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.ParameterObject> =>
  fc.record({
    name: nonEmptyStr(),
    in: fc.constant("path"),
    required: fc.constant(true),
    schema: schemaOrRef(schemas, arbSchema(schemas)),
  })

const arbHeader = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.HeaderObject> =>
  fc.record({
    required: oneOf([true, undefined]),
    schema: schemaOrRef(schemas, arbSchema(schemas)),
  })

const nonEmptyStr = (): fc.Arbitrary<string> => fc.string({ minLength: 1 })

const arbResponse = (
  status: number,
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.ResponseObject> =>
  fc.record({
    description: fc.constant(String(status)),
    headers: fc.dictionary(nonEmptyStr(), arbHeader(schemas)),
    content: fc.dictionary(
      nonEmptyStr(),
      fc.record({ schema: arbSchema(schemas) }),
    ),
  })

const arbOp = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): fc.Arbitrary<OpenAPIV3.OperationObject> =>
  fc.record({
    operationId: optional(nonEmptyStr()),
    parameters: fc
      .array(fc.oneof(arbOptParam(schemas), arbPathParam(schemas)))
      .map(arr => {
        const ret = Object.values(
          Object.fromEntries(arr.map(x => [`${x.in}-${x.name}`, x])),
        )
        ret.sort(compareParams)
        return ret
      }),
    responses: fc
      .integer({ min: 100, max: 599 })
      .chain(status =>
        fc.dictionary(
          fc.constant(String(status)),
          arbResponse(status, schemas),
        ),
      ),
  })

export const arbOpenApiDoc = (): fc.Arbitrary<OpenAPIV3.Document> =>
  fc.dictionary(nonEmptyStr(), arbSchema({})).chain(schemas =>
    fc.record<OpenAPIV3.Document>({
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
      servers: fc.array(
        fc.record({
          url: fc.webUrl(),
        }),
      ),
    }),
  )
