import fc from "fast-check"

import {
  NumFormat,
  RArr,
  RNum,
  RSchema,
  RString,
  SchemaOrRef,
  StringFormat,
} from "../endpoint"
import { CoreMethod, CoreOp, CorePaths, CoreService, RefsRec } from "../core"

const fromArr = <T>(...a: ReadonlyArray<T>): fc.Arbitrary<T> =>
  fc.oneof(...a.map(fc.constant))

const arbStringFormat = (): fc.Arbitrary<StringFormat> =>
  fromArr(
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

const arbRString = <Refs extends RefsRec>(
  itemsForTemplate: fc.Arbitrary<SchemaOrRef<Refs>>,
): fc.Arbitrary<RString<Refs>> =>
  fc.record({
    type: fc.constant("string"),
    format: optional(arbStringFormat()),
    minLength: optional(fc.nat()),
    maxLength: optional(fc.nat()),
    enum: optional(fc.array(fc.string())),
    template: optional(
      fc.record({
        strings: fc.array(fc.string()),
        expr: fc.array(itemsForTemplate),
      }),
    ),
  })

const arbNumFormat = (): fc.Arbitrary<NumFormat> =>
  fromArr("int32", "int64", "float", "double")

const arbArr = <Refs extends RefsRec>(
  items: fc.Arbitrary<SchemaOrRef<Refs>>,
): fc.Arbitrary<RArr<Refs>> =>
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

const arbSchema = <Refs extends RefsRec>(): fc.Arbitrary<RSchema<Refs>> =>
  fc.letrec<{ schema: RSchema<Refs> }>(tie => ({
    schema: fc.oneof(
      arbRString(tie("schema")),
      arbRNum(),
      arbArr(tie("schema")),
    ),
  })).schema

const arbSchemaOrRef = <Refs extends RefsRec>(
  refs: Refs,
): fc.Arbitrary<SchemaOrRef<Refs>> =>
  fc.oneof(arbSchema(), fromArr(...Object.keys(refs)))

const arbPath = () =>
  fc.array(fc.webSegment()).map(a => `/${a.join("/")}` as const)

const arbMethod = (): fc.Arbitrary<CoreMethod> =>
  fromArr("GET", "HEAD", "DELETE", "POST", "PUT", "PATCH")

const arbOp = <Refs extends RefsRec>(): fc.Arbitrary<CoreOp<Refs>> =>
  fc.record({
    name: optional(fc.string()),
    req: fc.record({}),
    res: fc.record({}),
  })

const arbPaths = <Refs extends RefsRec>(
  refs: Refs,
): fc.Arbitrary<CorePaths<Refs>> =>
  fc.dictionary(arbPath(), fc.dictionary(arbMethod(), arbOp()))

const arbRefs = <Refs extends RefsRec>(): fc.Arbitrary<Refs> =>
  fc.dictionary(fc.string({ minLength: 1 }), arbSchema()) as fc.Arbitrary<Refs>

export const arbCoreSvc = <Refs extends RefsRec>(): fc.Arbitrary<
  CoreService<Refs>
> =>
  arbRefs<Refs>().chain(refs =>
    fc.record({
      info: fc.record({
        title: fc.string(),
        version: fc
          .tuple(fc.nat(), fc.nat())
          .map(([major, minor]) => `${major}.${minor}` as const),
      }),
      refs: fc.constant(refs),
      paths: arbPaths(refs),
    }),
  )
