# Rationale

ResponsibleAPI exists because modern services need shared OpenAPI contracts, and
OpenAPI 3.1 is more expressive than today's generator ecosystem can reliably
consume.

Microservices should not share implementation models, databases, or internal
domain objects. They do, however, share contract vocabulary: identifiers,
timestamps, money, errors, pagination, resource references, actor metadata,
event metadata, and other types that appear at service boundaries.

OpenAPI is where that shared vocabulary belongs.

OpenAPI 3.1 aligned Schema Object semantics with JSON Schema 2020-12. That makes
contracts more expressive and composable: multi-file OpenAPI descriptions are
valid, schema references can cross documents, `$defs` is legal inside schemas,
and JSON Schema-native keywords such as `type: ["string", "null"]`, `$id`,
`$anchor`, `$dynamicRef`, and `unevaluatedProperties` are part of the language.

That expressiveness is useful for authors. It is not, by itself, a stable SDK
surface.

## Finding

The durable public model namespace for OpenAPI client and server generation is
`components.schemas`.

`$defs` is valid OpenAPI 3.1 because it is valid JSON Schema 2020-12, but
current client generators mostly do not treat `$defs` as a public SDK model
registry. They either preserve it as nested schema detail, lose it in type
projection edge cases, or give no stable guarantee about generated model names.

For generator-facing contracts, shared schemas should be promoted to
`components.schemas`, even when the conceptual JSON Schema shape could be
written with `$defs`.

That is not an argument for shared service internals. It is an argument for
shared public contract components with stable names and stable references.

## Tooling Notes

OpenAPI Generator supports OpenAPI 3.1 only as beta support. Its generator
feature matrices still vary heavily by target language. The `typescript-fetch`
generator, for example, documents missing support for union, `allOf`, `anyOf`,
`oneOf`, and `not`. This makes it risky to expose advanced JSON Schema
composition directly when predictable generated clients matter.

Kiota is the modern Microsoft OpenAPI client generator. It is built on
Microsoft.OpenAPI.NET, which models OpenAPI 3.1 and has explicit `$defs`
support. Kiota model documentation, however, still describes generated public
models in terms of `components` and inline operation schemas. That is the useful
contract boundary for SDK shape.

openapi-typescript supports OpenAPI 3.1 and documents `$defs` behavior directly.
It can reference `$defs`, but warns that `$defs` may not convert cleanly
depending on where it is placed; for example, `$defs` attached to primitive
schemas can disappear from the final TypeScript shape. This is a good example of
"valid schema" not being the same thing as "good generated API surface."

Orval v8 moved to an OpenAPI 3.1-oriented parser pipeline. That improves parser
coverage, but it does not remove the broader model-shape problem: codegen still
needs stable names, stable refs, and schemas organized in places generators
understand.

Speakeasy and Hey API advertise OpenAPI 3.1 support and are more modern
generator options. They still benefit from the same discipline: public reusable
types in `components.schemas`, service documents bundled or resolved before
generation, and advanced JSON Schema features used intentionally.

## ResponsibleAPI Position

ResponsibleAPI should compile expressive source contracts to conservative,
generator-friendly OpenAPI 3.1:

- Put reusable public contract types in `components.schemas`.
- Treat `$defs` as a local schema implementation detail, not as the public model
  namespace.
- Preserve OpenAPI 3.1 correctness, but avoid shapes that common generators only
  partially understand.
- Allow multi-file and shared source authoring, but make it easy to emit a
  bundled or resolved generator-ready document.
- Make nullable and optional fields explicit in the OpenAPI 3.1 way while
  keeping generated output predictable.
- Prefer stable schema names over clever inline composition when those schemas
  are visible in client or server code.

The goal is not to reduce OpenAPI 3.1 to OpenAPI 3.0 habits. The goal is to let
service teams author real OpenAPI 3.1 while publishing contracts that survive
today's generators.

## Practical Rule

If a schema should become a named type in generated code, emit it under
`components.schemas`.

If a schema only helps define another schema and should not become public
contract surface, `$defs` is acceptable.

If a document is authored with external references, bundle or otherwise resolve
it before feeding weaker generators.

ResponsibleAPI's value is the boundary between the expressive contract authors
want and the constrained shapes generators can reliably consume.
