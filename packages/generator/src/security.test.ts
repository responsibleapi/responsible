import { describe, expect, test } from "vitest"
import { kdl } from "./kdl.test"
import { parseSecurity, type ParsedSecurity } from "./security"

describe("security", () => {
  test("optional", () => {
    expect(
      parseSecurity(
        kdl`
        (?)security {
            OR {
                header "authorization"
                cookie "token"
            }
        }
        `.output![0],
      ),
    ).toEqual({
      securitySchemes: {
        AuthorizationHeader: {
          type: "apiKey",
          in: "header",
          name: "authorization",
        },
        TokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      security: [{ AuthorizationHeader: [] }, { TokenCookie: [] }, {}],
    } satisfies ParsedSecurity)
  })

  test("old listenbox security", () => {
    expect(
      parseSecurity(
        kdl`
        security {
            OR {
                header "authorization"
                cookie "token"
            }
        }`.output![0],
      ),
    ).toEqual({
      securitySchemes: {
        AuthorizationHeader: {
          type: "apiKey",
          in: "header",
          name: "authorization",
        },
        TokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      security: [{ AuthorizationHeader: [] }, { TokenCookie: [] }],
    } satisfies ParsedSecurity)
  })

  test("youtube security", () => {
    expect(parseSecurity(kdl`security { query "key"; }`.output![0])).toEqual({
      securitySchemes: {
        KeyQuery: {
          type: "apiKey",
          in: "query",
          name: "key",
        },
      },
      security: [{ KeyQuery: [] }],
    } satisfies ParsedSecurity)
  })

  test("listenbox security", () => {
    expect(
      parseSecurity(kdl`(?)security {  header "authorization"; }`.output![0]),
    ).toEqual({
      securitySchemes: {
        AuthorizationHeader: {
          type: "apiKey",
          in: "header",
          name: "authorization",
        },
      },
      security: [{ AuthorizationHeader: [] }, {}],
    } satisfies ParsedSecurity)
  })
})
