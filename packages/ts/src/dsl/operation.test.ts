import { describe, test } from "vitest"
import type {
  Assert,
  IsEqual,
  IsNever,
  OneExtendsTwo,
} from "../help/type-assertions.ts"
import type { GetOp, GetOpReq, Op, OpReq, ReqAugmentation } from "./operation.ts"
import type { PathParams } from "./params.ts"
import { declareTags } from "./tags.ts"

describe("operation", () => {
  test("only GET operations accept synthetic HEAD ids", () => {
    type _OpRejectsHeadID = Assert<IsNever<Extract<"headID", keyof Op>>>

    type _OpGETAcceptsHeadID = Assert<
      IsEqual<Extract<"headID", keyof GetOp>, "headID">
    >
  })

  test("accepts declared tags on operations", () => {
    const tags = declareTags({
      videos: {},
      channels: {},
    } as const)

    type _Test = Assert<
      IsEqual<
        NonNullable<Op<typeof tags>["tags"]>,
        readonly (typeof tags.videos | typeof tags.channels)[]
      >
    >
  })

  test("accepts non-optional path param names", () => {
    type _Test = Assert<
      OneExtendsTwo<{ videoID: { type: "string" } }, PathParams>
    >
  })

  test("accepts inline map-style request params alongside legacy bare schemas", () => {
    type _PathInline = Assert<
      OneExtendsTwo<
        {
          videoID: {
            schema: { type: "string" }
            style: "label"
          }
        },
        PathParams
      >
    >
    type _QueryInline = Assert<
      OneExtendsTwo<
        {
          "page?": {
            schema: { type: "integer" }
            example: 1
            style: "form"
          }
        },
        NonNullable<GetOpReq["query"]>
      >
    >
    type _HeaderInline = Assert<
      OneExtendsTwo<
        {
          "X-Trace?": {
            schema: { type: "string" }
            description: "Trace id"
          }
        },
        NonNullable<GetOpReq["headers"]>
      >
    >
    type _QueryJustSchema = Assert<
      OneExtendsTwo<
        { filter: { type: "string" } },
        NonNullable<GetOpReq["query"]>
      >
    >
  })

  test('makes `body` and `"body?"` mutually exclusive', () => {
    type _BodyAllowed = Assert<
      OneExtendsTwo<{ body: { type: "string" } }, OpReq>
    >
    type _OptionalBodyAllowed = Assert<
      OneExtendsTwo<{ "body?": { type: "string" } }, OpReq>
    >
    type _NeitherAllowed = Assert<OneExtendsTwo<{}, OpReq>>
    type _ReqWithBothBodyKinds = {
      body: { type: "string" }
      "body?": { type: "string" }
    }
    type _ReqAugmentationWithBothBodyKinds = {
      mime: "application/json"
      body: { type: "string" }
      "body?": { type: "string" }
    }
    type _BothRejected = Assert<
      IsEqual<OneExtendsTwo<_ReqWithBothBodyKinds, OpReq>, false>
    >
    type _ReqAugmentationAlsoRejectsBoth = Assert<
      IsEqual<
        OneExtendsTwo<_ReqAugmentationWithBothBodyKinds, ReqAugmentation>,
        false
      >
    >
  })

  test('rejects path param names ending with "?"', () => {
    type _Test = Assert<
      IsEqual<
        OneExtendsTwo<{ "videoID?": { type: "string" } }, PathParams>,
        false
      >
    >
  })
})
