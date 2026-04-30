# ResponsibleAPI

TypeScript tooling for defining OpenAPI 3.1 contracts and validating Hono
handlers against them.

## Packages

- [`@responsibleapi/ts`](packages/ts/) is the TypeScript DSL and compiler for
  OpenAPI 3.1 documents.
- [`@responsibleapi/hono`](packages/hono/) validates Hono requests and responses
  against OpenAPI documents.

## Define An API

```sh
bun add @responsibleapi/ts
```

```ts
import { GET, object, responsibleAPI, resp, string } from "@responsibleapi/ts"

export const api = responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "Example API",
      version: "1.0.0",
    },
  },
  routes: {
    "/hello": GET({
      res: {
        200: resp({
          description: "OK",
          body: object({
            message: string(),
          }),
        }),
      },
    }),
  },
})
```

## Use With Hono

```sh
bun add @responsibleapi/hono
```

```ts
import { openApiRouter } from "@responsibleapi/hono"
import { Hono } from "hono"
import type { oas31 } from "openapi3-ts"

new Hono().route(
  "",
  openApiRouter({
    handlers,
    securityHandlers,
    doc: api as oas31.OpenAPIObject,
  }),
)
```

## Development

```sh
task check
```
