import fc from "fast-check"

import {
  CoreMethod,
  CoreMimes,
  CoreOp,
  CorePaths,
  CoreRes,
  CoreService,
  CoreStatus,
  CoreTypeRefs,
} from "../core"
import {
  NumFormat,
  OptionalBag,
  RArr,
  RNum,
  RSchema,
  RString,
  RStruct,
  SchemaOrRef,
  StringFormat,
} from "../schema"

const oneOf = <T>(...a: ReadonlyArray<T>): fc.Arbitrary<T> =>
  fc.oneof(...a.map(fc.constant))

const arbStringFormat = (): fc.Arbitrary<StringFormat> =>
  oneOf(
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
  )

const optional = <T>(a: fc.Arbitrary<T>): fc.Arbitrary<T | undefined> =>
  fc.option(a, { nil: undefined })

const arbRString = (): fc.Arbitrary<RString> =>
  fc.record({
    type: fc.constant("string"),
    format: optional(arbStringFormat()),
    minLength: optional(fc.nat()),
    maxLength: optional(fc.nat()),
    enum: optional(fc.array(fc.string())),
  })

const arbNumFormat = (): fc.Arbitrary<NumFormat> =>
  oneOf("int32", "int64", "float", "double")

const arbArr = (items: fc.Arbitrary<SchemaOrRef>): fc.Arbitrary<RArr> =>
  fc.record({
    type: fc.constant("array"),
    items,
  })

const arbRNum = (): fc.Arbitrary<RNum> =>
  fc.record({
    type: fc.constant("number"),
    format: optional(arbNumFormat()),
    minimum: optional(fc.double()),
    maximum: optional(fc.double()),
    range: optional(
      fc.record({
        start: fc.double(),
        end: fc.double(),
        step: fc.double(),
      }),
    ),
  })

const arbStruct = (
  schema: fc.Arbitrary<SchemaOrRef>,
): fc.Arbitrary<RStruct> => {
  throw new Error("not implemented")
}

const arbSchema = (): fc.Arbitrary<RSchema> =>
  fc.letrec<{ schema: RSchema }>(tie => ({
    schema: fc.oneof(
      arbRString(),
      arbRNum(),
      arbArr(tie("schema")),
      arbStruct(tie("schema")),
    ),
  })).schema

const arbSchemaOrRef = (refs: CoreTypeRefs): fc.Arbitrary<SchemaOrRef> =>
  fc.oneof(arbSchema(), oneOf(...Object.keys(refs)))

const arbPath = () =>
  fc.array(fc.webSegment()).map(a => `/${a.join("/")}` as const)

const arbMethod = (): fc.Arbitrary<CoreMethod> =>
  oneOf("GET", "HEAD", "DELETE", "POST", "PUT", "PATCH")

const arbBag = (): fc.Arbitrary<OptionalBag> => {
  throw new Error("not implemented")
}

const arbMimes = (): fc.Arbitrary<CoreMimes> => {
  throw new Error("not implemented")
}

const arbRes = (): fc.Arbitrary<CoreStatus> =>
  fc.record({
    headers: optional(arbBag()),
    body: optional(arbMimes()),
  })

const arbOp = (): fc.Arbitrary<CoreOp> =>
  fc.record({
    name: optional(fc.string()),
    req: fc.record({}),
    res: fc
      .dictionary(
        fc.integer({ min: 100, max: 599 }).map(x => x.toString()),
        arbRes(),
      )
      .map(x => x as unknown as CoreRes),
  })

const arbPaths = (): fc.Arbitrary<CorePaths> =>
  fc.dictionary(arbPath(), fc.dictionary(arbMethod(), arbOp()))

const arbRefs = (): fc.Arbitrary<CoreTypeRefs> =>
  fc.dictionary(
    fc.string({ minLength: 1 }),
    arbSchema(),
  ) as fc.Arbitrary<CoreTypeRefs>

export const arbCoreSvc = (): fc.Arbitrary<CoreService> =>
  arbRefs().chain(refs =>
    fc.record({
      info: fc.record({
        title: fc.string(),
        version: fc
          .tuple(fc.nat(), fc.nat())
          .map(([major, minor]) => `${major}.${minor}` as const),
      }),
      refs: fc.constant(refs),
      paths: arbPaths(),
      servers: fc.array(fc.record({ url: fc.webUrl() })),
    }),
  )
