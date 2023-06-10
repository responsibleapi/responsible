import { parse } from "kdljs"
import { expect, test } from "vitest"
import { parseSecurity } from "./security"

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
  ).toEqual(<ReturnType<typeof parseSecurity>>{
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
  })
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
  ).toEqual(<ReturnType<typeof parseSecurity>>{
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
  })
})

test("youtube security", () => {
  expect(
    parseSecurity(
      parse(`
        security {
          query "key"
        }`).output[0],
    ),
  ).toEqual(<ReturnType<typeof parseSecurity>>{
    securitySchemes: {
      KeyQuery: {
        type: "apiKey",
        in: "query",
        name: "key",
      },
    },
    security: [{ KeyQuery: [] }],
  })
})

test("listenbox security", () => {
  expect(
    parseSecurity(
      parse(`
        (?)security {
          header "authorization"
        }`).output[0],
    ),
  ).toEqual(<ReturnType<typeof parseSecurity>>{
    securitySchemes: {
      AuthorizationHeader: {
        type: "apiKey",
        in: "header",
        name: "authorization",
      },
    },
    security: [{ AuthorizationHeader: [] }, {}],
  })
})
