import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import type { Assert, IsEqual, OneExtendsTwo } from "../help/type-assertions.ts"
import { named } from "./nameable.ts"
import {
  type OAuth2ScopeName,
  type Security,
  headerSecurity,
  httpSecurity,
  oauth2Security,
  oauth2Requirement,
  securityAND,
  securityOR,
  querySecurity,
} from "./security.ts"

describe("security", () => {
  test("builds api-key security schemes", () => {
    expect(
      querySecurity({
        name: "key",
        description: "API key auth",
      }),
    ).toEqual({
      type: "apiKey",
      in: "query",
      name: "key",
      description: "API key auth",
    })

    expect(headerSecurity({ name: "authorization" })).toEqual({
      type: "apiKey",
      in: "header",
      name: "authorization",
    })
  })

  test("builds http security schemes", () => {
    type _HttpAuthSchemeCases = Assert<
      IsEqual<
        Parameters<typeof httpSecurity>[0]["scheme"],
        "basic" | "bearer" | "Basic" | "Bearer" | "BASIC" | "BEARER"
      >
    >

    expect(
      httpSecurity({
        scheme: "Basic",
        description: "Basic auth",
      }),
    ).toEqual({
      type: "http",
      scheme: "Basic",
      description: "Basic auth",
    })
  })

  test("builds oauth2 security schemes", () => {
    expect(
      oauth2Security({
        description: "Google OAuth2",
        flows: {
          implicit: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            scopes: {
              "scope:read": "Read data",
            },
          },
          authorizationCode: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            tokenUrl: "https://accounts.google.com/o/oauth2/token",
            scopes: {
              "scope:write": "Write data",
            },
          },
        },
      }),
    ).toEqual({
      type: "oauth2",
      description: "Google OAuth2",
      flows: {
        implicit: {
          authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
          scopes: {
            "scope:read": "Read data",
          },
        },
        authorizationCode: {
          authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
          tokenUrl: "https://accounts.google.com/o/oauth2/token",
          scopes: {
            "scope:write": "Write data",
          },
        },
      },
    })
  })

  test("builds composed security requirements", () => {
    const Oauth2 = named(
      "Oauth2",
      oauth2Security({
        description: "Google OAuth2",
        flows: {
          implicit: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            scopes: {
              "scope:read": "Read data",
              "scope:write": "Write data",
            },
          },
        },
      }),
    )

    const Oauth2c = named(
      "Oauth2c",
      oauth2Security({
        description: "Google OAuth2 code flow",
        flows: {
          authorizationCode: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            tokenUrl: "https://accounts.google.com/o/oauth2/token",
            scopes: {
              "scope:read": "Read data",
              "scope:write": "Write data",
            },
          },
        },
      }),
    )

    expect(
      securityOR(
        securityAND(
          oauth2Requirement(Oauth2, ["scope:read"]),
          oauth2Requirement(Oauth2c, ["scope:read"]),
        ),
        securityAND(
          oauth2Requirement(Oauth2, ["scope:write"]),
          oauth2Requirement(Oauth2c, ["scope:write"]),
        ),
      ),
    ).toEqual({
      requirements: [
        {
          Oauth2: ["scope:read"],
          Oauth2c: ["scope:read"],
        },
        {
          Oauth2: ["scope:write"],
          Oauth2c: ["scope:write"],
        },
      ],
      schemes: [Oauth2, Oauth2c],
    })
  })

  test("types oauth2 scopes from declared flows", () => {
    const Oauth2 = named(
      "Oauth2",
      oauth2Security({
        flows: {
          implicit: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            scopes: {
              "scope:read": "Read data",
              "scope:write": "Write data",
            },
          },
          authorizationCode: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            tokenUrl: "https://accounts.google.com/o/oauth2/token",
            scopes: {
              "scope:admin": "Admin data",
            },
          },
        },
      }),
    )

    type _InfersScopeNames = Assert<
      IsEqual<
        OAuth2ScopeName<typeof Oauth2>,
        "scope:admin" | "scope:read" | "scope:write"
      >
    >

    expect(oauth2Requirement(Oauth2, ["scope:admin"])).toEqual({
      requirement: {
        Oauth2: ["scope:admin"],
      },
      schemes: [Oauth2],
    })
  })

  test("keeps raw requirement objects free of hidden metadata", () => {
    const Oauth2 = named(
      "Oauth2",
      oauth2Security({
        flows: {
          implicit: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            scopes: {
              "scope:read": "Read data",
            },
          },
        },
      }),
    )

    const requirement = oauth2Requirement(Oauth2, ["scope:read"])

    expect(Object.getOwnPropertySymbols(requirement.requirement)).toEqual([])
  })

  test("keeps named schemes as security values", () => {
    const Authorization = () => headerSecurity({ name: "authorization" })

    expect(Authorization().type).toBe("apiKey")

    type _HeaderIsSecurity = Assert<
      OneExtendsTwo<typeof Authorization, Security>
    >
  })

  test("accepts http security schemes as security values", () => {
    const BearerAuth = (): oas31.SecuritySchemeObject =>
      httpSecurity({
        scheme: "bearer",
      })

    expect(BearerAuth().type).toBe("http")

    type _HttpIsSecurity = Assert<OneExtendsTwo<typeof BearerAuth, Security>>
  })

  test("reports anonymous scheme thunk details in requirement errors", () => {
    expect(() =>
      securityOR(
        () => headerSecurity({ name: "authorization" }),
        named("ApiKey", querySecurity({ name: "key" })),
      ),
    ).toThrow(
      /security requirements need a named scheme; got inline value \{"type":"apiKey","in":"header","name":"authorization"\}; use a named function or named\(\)/,
    )
  })
})
