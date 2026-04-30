# ResponsibleAPI

[![npm version](https://img.shields.io/npm/v/%40responsibleapi%2Fts)](https://www.npmjs.com/package/@responsibleapi/ts)

TypeScript [DSL](src/dsl/) that [compiles](src/compiler/) to OpenAPI 3.1
documents.

## Rationale

- OpenAPI YAML is hard to refactor.
- Microservices should not share implementation models, but they do share
  contract vocabulary: `Money`, `CurrencyCode`, error shapes, pagination, and
  similar boundary types.
- `$defs` is valid OpenAPI 3.1, but it is not a reliable public model namespace
  for generated SDKs. Shared contract types should compile into each service
  document's local `components.schemas` with stable `#/components/schemas/...`
  refs.

## Install

```sh
npm install @responsibleapi/ts
```

Requires Node `22.18.0+` for plain `node api.ts` workflows.

## Usage

```ts
import { GET, object, responsibleAPI, resp, string } from "@responsibleapi/ts"

const api = responsibleAPI({
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

console.log(JSON.stringify(api, null, 2))
```

## YAML Output

```ts
import { YAML } from "bun"
import { GET, object, responsibleAPI, resp, string } from "@responsibleapi/ts"

const api = responsibleAPI({
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

console.log(YAML.stringify(api))
```

Bun YAML docs: <https://bun.com/docs/runtime/yaml>

## Development

Use `bun`
