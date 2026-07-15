---
name: responsibleapi
description: Use when working on `*.responsible.ts` files
---

# responsibleapi

Use this skill for `*.responsible.ts` files and other TypeScript that builds
OpenAPI with `@responsibleapi/ts`.

Target is OpenAPI `3.1+` only.

Keep this skill focused on authoring expressive TypeScript DSL code. State which
DSL form to use and when. Avoid discussion of runtime tooling or downstream
representation.

## Mental Model

`responsibleapi` is TypeScript DSL for declaring OpenAPI 3.1 APIs.

- Start with `responsibleAPI({ partialDoc, routes, ...defaults })`.
- Use `partialDoc` only for the base document metadata and deliberately authored
  raw OpenAPI fields. Keep `components` and top-level `security` out unless you
  know the exact reason.
- `routes` is path map.
- Use method helpers like `GET(...)`, `POST(...)`, `PUT(...)`, `DELETE(...)`,
  `HEAD(...)` for single-method top-level paths.
- Use `scope({ ... })` when path has nested routes, shared params, shared
  security, or multiple methods.
- Inside `scope`, direct methods are plain object keys like `GET: { ... }`,
  `POST: { ... }`.
- Inside `scope`, nested single-method paths can still use method helpers:
  `"/items": GET({ ... })`.
- Paths use colon params: `"/users/:id"`.

## Maximal Expressiveness

Use the richest DSL construct that states author intent directly:

- Prefer semantic helpers over raw objects: schema builders, params, response
  helpers, security helpers, tag helpers, and method helpers.
- Put shared behavior at the narrowest common place: root defaults for the whole
  API, `scope` defaults for a route group, operation fields for one endpoint.
- Never use `scope(...)` or scope-level `forEachOp` for a single operation. Use
  the method helper directly and keep one-operation behavior on that operation.
- Use stable TypeScript identifiers for concepts that are reused or externally
  meaningful.
- Prefer identifier thunks over `named(...)`. When the desired component name is
  a valid TypeScript/JavaScript identifier, name the thunk with that identifier
  and pass the thunk itself. Use `named(...)` only when an exact stable component
  name cannot be an identifier and component reuse is genuinely required.
- Never convert identifier thunks to `named(...)` merely to match another named
  value. For response headers whose exact HTTP spelling cannot be an identifier,
  prefer an inline `headers` entry at the narrowest shared `res.defaults` or
  operation level over a named component.
- Use thunks for reusable values and pass the thunk itself through the DSL's
  matching reuse slot. Never call a reusable user-defined thunk anywhere in
  authored DSL code; no exceptions. Use `Config`, not `Config()`.
- Never create or call reusable thunks that return field maps or DSL fragments.
  Ban forms such as `headers: TraceHeaders()` and
  `headers: { ...TraceHeaders() }`. Either inline a one-off value or model each
  reusable value with the semantic helper and pass its thunk through the DSL's
  reuse slot.
- Add local meaning with helper options such as `description`, `examples`,
  `format`, `pattern`, numeric bounds, `deprecated`, operation `id`, `tags`,
  response headers, cookies, and MIME choices.
- Use `resp(...)` when a response needs a description, headers, cookies, MIME
  details, or other response-level metadata.
- Use `ref(...)` when reusing a named value with local metadata.
- Use raw OpenAPI objects only when the DSL has no helper for the construct;
  keep the raw object local, typed, and small.
- Treat the document returned by `responsibleAPI(...)` as immutable output.
  Never inspect or mutate `paths`, `components`, responses, content, schemas,
  references, or any other compiled field to repair the document after DSL
  compilation. After `responsibleAPI(...)`, only serialize or return the
  document.
- Express the complete contract in the DSL. Ban post-compilation patches such
  as replacing `itemSchema`, injecting `$ref`, or walking a compiled response
  to change it. If the DSL cannot express a required construct, report or fix
  the DSL limitation instead of patching its output.

## Minimal Example

```ts
import { GET, object, responsibleAPI, resp, string } from "@responsibleapi/ts"

responsibleAPI({
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

## Schema Authoring

Use schema builders for OpenAPI schemas and prefer tiny schema thunks for
reusable shapes:

```ts
const UserID = () => int64({ minimum: 1 })

const User = () =>
  object({
    id: UserID,
    name: string(),
    "nickname?": string(),
  })
```

Common schema builders:

- `object`, `array`, `dict`
- `string`, `boolean`, `number`, `integer`
- `int32`, `int64`, `uint32`, `uint64`, `float`, `double`
- `unknown`, `nullable`, `oneOf`, `anyOf`, `allOf`
- `email`, `httpURL`, `isoDuration`, `unixMillis`

Rules:

- Required object keys are plain keys.
- Optional object keys end with `?`, quoted as needed for TypeScript object
  syntax, for example `"nickname?"`.
- Optional means the property may be absent. Do not use `nullable()` for
  optional fields unless the user explicitly asks to allow JSON `null`.
- For reusable schemas, pass the thunk itself, not `Thunk()`, when nesting it in
  another schema, request, response, or parameter map.
- The no-call rule applies to user-defined reusable thunks. DSL builders such as
  `string(...)`, `object(...)`, `resp(...)`, and `responseHeader(...)` are
  called when constructing an inline value or defining a reusable thunk.
- Inline one-off schemas are fine when reuse does not matter.
- Never use `missingSchemas` when `routes` is non-empty. Every schema component
  must be reachable from the request or response graph of a declared route.
- `missingSchemas` is permitted only for a schema-only document whose `routes`
  map is empty. Include the top-level schema thunk that reaches the rest of the
  graph; do not list every nested schema when one top-level schema already uses
  them all.
- Use `named("component-name", value)` only when
  schema/parameter/security/header needs a stable component name that cannot be
  expressed as a valid TypeScript/JavaScript identifier.
- Ban wrappers such as `named("NonEmptyString", NonEmptyString())`.
  `NonEmptyString` is already a valid identifier, so pass `NonEmptyString`
  directly.
- Use `ref(NamedValue, { description })` when you want to reuse a named value
  and add local metadata.
- Raw OpenAPI 3.1 schema objects are allowed when DSL has no helper. Keep them
  local, typed, and rare.

## Discriminated Unions

Use `oneOf` with an OpenAPI discriminator for tagged object unions:

```ts
const TcpListenerConfig = () =>
  object({
    kind: string({ const: "tcp" }),
    addr: NonEmptyString,
  })

const UnixListenerConfig = () =>
  object({
    kind: string({ const: "unix" }),
    path: NonEmptyString,
  })

const ListenerConfig = () =>
  oneOf([TcpListenerConfig, UnixListenerConfig], {
    discriminator: {
      propertyName: "kind",
      mapping: {
        tcp: TcpListenerConfig,
        unix: UnixListenerConfig,
      },
    },
  })
```

Rules:

- Put the tag field on every variant with `string({ const: "tag-value" })`.
- Use a stable tag property name such as `kind`, `mode`, or `type`.
- Define each variant as a reusable schema thunk when it is externally
  meaningful or reused.
- Pass variant thunks to both the `oneOf([...])` list and discriminator
  `mapping`; do not call them there.
- Keep discriminator mapping keys exactly aligned with each variant's constant
  tag value.

## Domain Value Shapes

Use semantic helpers or small named objects for common domain values.

Use `isoDuration(...)` for RFC 3339 / ISO 8601 duration intervals:

```ts
const BillingPeriod = () =>
  isoDuration({
    description: "Subscription billing period length.",
    examples: ["P1M"],
  })
```

For money, prefer a tiny object over loose sibling fields:

```ts
const Money = () =>
  object({
    amount: int64({ description: "Minor units, e.g. cents." }),
    currency: string({ pattern: "^[A-Z]{3}$" }),
  })
```

## Shared Contract Vocabulary

Microservices should not share implementation models, but they can share
contract vocabulary. Put boundary concepts such as `Money`, `CurrencyCode`,
error shapes, pagination, and file responses in a shared TypeScript module like
`packages/openapi/spec/shared.responsible.ts`.

Rules:

- Export reusable schema or response thunks, for example `Money` or
  `WorkbookExportResponse`.
- Import those thunks into each service's `*.responsible.ts` file and pass the
  thunk itself when nesting it.
- Keep service-specific request and response objects in the service file; only
  promote stable cross-service vocabulary to the shared module.
- Prefer stable named contract concepts that compile into each service
  document's local `components.schemas` or `components.responses`.
- Do not use `$defs` as the public shared model namespace for generated SDKs;
  OpenAPI 3.1 allows it, but local `#/components/...` refs are more reliable.
- Do not put shared contracts in `partialDoc.components`; let the DSL discover
  usage and emit local components for each service document.

## Root Structure

```ts
responsibleAPI({
  partialDoc,
  security?,
  forEachOp?,
  forEachPath?,
  routes,
})
```

Use root defaults for cross-cutting behavior:

- `forEachOp` for shared operation defaults.
- `forEachPath` for shared path-level params.
- `security` for global auth requirements.

Typical `forEachOp` uses:

- `req.mime`
- `req.security`
- `res.mime`
- `res.defaults`
- `res.add`
- `tags`

Typical `forEachPath` use:

- `params`

## Routes And Scopes

Single top-level route:

```ts
"/users": GET({
  res: { 200: Users },
})
```

Top-level route with explicit operation id:

```ts
"/users": POST("createUser", {
  req: CreateUser,
  res: { 201: User },
})
```

Nested/shared path behavior:

```ts
"/users": scope({
  "/:id": scope({
    pathParams: {
      id: UserID,
    },
    GET: {
      res: { 200: User },
    },
    DELETE: {
      res: { 204: resp({ description: "Deleted" }) },
    },
  }),
})
```

Rules:

- Use method helpers for single-method paths at root or nested path values.
- Ban single-operation `scope(...)` wrappers, including wrappers created only to
  attach `forEachOp`. `forEachOp` requires multiple operations that genuinely
  share its behavior.
- Use method keys inside the `scope` object that directly owns the methods.
- Put shared `pathParams`, `params`, `forEachOp`, and `security` on nearest
  scope that owns them.

## Synthetic HEAD

`GET` operations can declare `headID` to pair with `HEAD`:

```ts
"/feed": GET({
  id: "getFeed",
  headID: "headFeed",
  res: { 200: Feed },
})
```

Rules:

- `headID` belongs on `GET`.
- Use `headID` when `GET` and `HEAD` should stay aligned.
- Use explicit `HEAD` when headers, statuses, or other behavior must diverge.

## Request Shape

For non-`GET` operations, request body shorthand is allowed:

```ts
req: CreateUser
```

Expanded request forms:

```ts
req: {
  body: CreateUser,
}

req: {
  "body?": CreateUser,
}
```

Inline params:

- `req.query`
- `req.headers`
- `req.pathParams`

Rules:

- Optional query/header keys end with `?`.
- Path params cannot be optional.
- Path params can live on operation, scope, or `forEachPath`.

Reusable params:

- `const cursor = () => queryParam(...)`
- `const userID = () => pathParam(...)`
- `const requestID = () => headerParam(...)`

Use `named(...)` only when the exact reusable parameter name cannot be a
TypeScript/JavaScript identifier.

Then reuse with:

- `req.params`
- `forEachPath.params`

## Response Shape

Responses are status maps:

```ts
res: {
  200: User,
  404: resp({ description: "Not found" }),
}
```

Detailed response:

```ts
res: {
  200: resp({
    description: "OK",
    body: {
      "application/json": User,
    },
    headers: {
      "x-request-id": string(),
    },
  }),
}
```

Rules:

- Response `body` can be schema or MIME map.
- Use `res.defaults` for shared headers/mime across status ranges like
  `"100..599"`.
- Use `res.add` for default statuses inherited by many operations.
- One-off response headers go in `headers`.
- Reusable response headers use identifier thunks with `responseHeader(...)`
  and pass those thunks through `headerParams`. Do not mix named values and
  response-header thunks in one API.
- When an exact HTTP header name cannot be a TypeScript/JavaScript identifier,
  first keep it inline under `headers` at the narrowest common `res.defaults` or
  operation level. Prefer repeating a small inline header declaration over
  converting otherwise valid response-header thunks to `named(...)`.
- Use `named("header", responseHeader(...))` only as a last resort when the exact
  component name and component reuse are both required and inline placement
  cannot express the contract. If that last resort is necessary, keep other
  response headers inline rather than combining the named header with reusable
  response-header thunks.
- OpenAPI 3.1 and 3.2 can reference each Header Object, not an entire response
  `headers` map. Never abstract or spread a reusable headers map. Define each
  shared header with `responseHeader(...)` and pass its thunk in
  `headerParams`; keep one-off headers inline in `headers`.
- Use `cookies` for response cookies.

## Parameters

Three main patterns:

1. Inline, local:

```ts
req: {
  query: {
    "cursor?": string(),
  },
}
```

2. Shared at path/scope level:

```ts
forEachPath: {
  params: [CursorParam],
}
```

3. Path segment ownership:

```ts
pathParams: {
  id: UserID,
}
```

Use nearest shared level that keeps intent obvious.

## Security

Security helpers:

- `headerSecurity`
- `querySecurity`
- `httpSecurity`
- `oauth2Security`
- `oauth2Requirement`
- `securityAND`
- `securityOR`

Rules:

- Name security schemes when they need stable component identity.
- `security` means authenticated request required.
- `"security?"` means operation may be authenticated or anonymous.
- Put shared auth on scope or `forEachOp` when most operations need it.

## Tags

Prefer declared tags:

```ts
const tags = declareTags({
  Users: {},
  Admin: {},
} as const)
```

Then:

- put `Object.values(tags)` into `partialDoc.tags`
- use `tags: [tags.Users]` on operations

## What Good Files Look Like

Good `*.responsible.ts` files usually:

- keep schemas tiny and composable
- move repeated defaults into `forEachOp` or nearest `scope`
- name reusable components once
- keep raw OpenAPI escape hatches small and local
- model params where path ownership is obvious
- stay OpenAPI 3.1-native

## Public Examples

Use these as source-of-truth patterns:

- [`http-benchmark.ts`](https://raw.githubusercontent.com/responsibleapi/ts/master/src/examples/http-benchmark.ts):
  compact request/response defaults, schema thunks
- [`exceptions.ts`](https://raw.githubusercontent.com/responsibleapi/ts/master/src/examples/exceptions.ts):
  scoped path params, inherited JSON defaults
- [`listenbox.ts`](https://raw.githubusercontent.com/responsibleapi/ts/master/src/examples/listenbox.ts):
  nested scopes, optional security, cookies, `HEAD`
- [`youtube.ts`](https://raw.githubusercontent.com/responsibleapi/ts/master/src/examples/youtube.ts):
  `forEachPath.params`, OAuth2 requirements, large named schema graph
- [`pachca.ts`](https://raw.githubusercontent.com/responsibleapi/ts/master/src/examples/pachca.ts):
  large API surface, inline params, raw OpenAPI 3.1 escape hatches
