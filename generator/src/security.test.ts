import { parse } from "kdljs"
import { expect, test } from "vitest"
import { parseSecurity, type ParsedSecurity } from "./security"

test("optional", () => {
  expect(
    parseSecurity(
      parse(`
        (?)security {
            OR {
                header "authorization"
                cookie "token"
            }
        }`).output[0],
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
      parse(`
        security {
            OR {
                header "authorization"
                cookie "token"
            }
        }`).output[0],
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
  expect(
    parseSecurity(
      parse(`
        security {
          query "key"
        }`).output[0],
    ),
  ).toEqual({
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
    parseSecurity(
      parse(`
        (?)security {
          header "authorization"
        }`).output[0],
    ),
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
