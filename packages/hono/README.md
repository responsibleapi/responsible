# OpenAPI tooling for [Hono](https://hono.dev)

```sh
brew install openapi-generator bun
```

TODO: describe generating handler types from OpenAPI

![Responsible Hono version](https://img.shields.io/npm/v/@responsibleapi/hono)

```sh
bun install @responsibleapi/hono
```

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
