# Responsible

OpenAPI toolkit

## Problems OpenAPI solves

- Client & server team collaboration
- Server request validation
- Server response validation (e.g. https://schemathesis.io)
- Client generation (https://openapi-generator.tech, https://microsoft.github.io/kiota)
- Mock server generation
- Backwards compatibility verification
- Language and framework independence

## OpenAPI's problem: verbosity

Responsible builds on top of OpenAPI and solves **the only problem OpenAPI has: verbosity**.
It's hard to create, modify and read.

Frameworks like [FastAPI](https://fastapi.tiangolo.com) have a way to generate the spec from code, but you lose:

- Client & server team collaboration (the spec is engraved in the server code)
- Language and framework independence (more effort to get off the framework)

[Stoplight](https://stoplight.io) simplifies OpenAPI management, but lacks coherence with the codebase,
requiring synchronization between the spec and the code.

## Problems Responsible solves

### Custom DSL

- OpenAPI DSL is extremely verbose and hard to read. It's also hard to maintain. This library provides a custom DSL that
  is much more readable and maintainable.

## CLI

```shell
brew tap responsibleapi/responsible
brew install responsible
```
