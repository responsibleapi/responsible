# OpenAPI request and response validators for [Hono](https://hono.dev)

![Responsible Hono version](https://img.shields.io/npm/v/@responsibleapi/hono)

```sh
bun install @responsibleapi/hono
```

## Validate requests

```sh
brew install openapi-generator
```

TODO: describe generating handler types from OpenAPI

```typescript
import { type Env, Hono, type MiddlewareHandler } from "hono"
import openApiInternal from "../openapi/openapi-internal.json" with { type: "json" }
import { openApiRouter } from "@responsibleapi/hono"
import type { oas31 } from "openapi3-ts"
import localizeEn from "ajv-i18n/localize/en"

new Hono().route(
  "",
  openApiRouter({
    handlers,
    securityHandlers,
    doc: openApiInternal as oas31.OpenAPIObject,
    onErrors: (ctx, errors) => {
      localizeEn(errors)
      return ctx.json({ errors } satisfies Err, 400)
    },
  }),
)
```

## Validate responses
