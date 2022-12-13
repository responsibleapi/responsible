import { parseSecurity } from "./request"
import { expect, test } from "vitest"
import { parse } from "kdljs"

test.concurrent("listenbox security", () => {
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

test.concurrent("youtube security", () => {
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
