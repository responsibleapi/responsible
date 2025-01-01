# ResponsibleAPI

A small language that compiles to [OpenAPI](https://www.openapis.org) 3.1.0.

## Language

Responsible is based on [KDL 1.0.0](https://kdl.dev).

- [Examples](examples/)
- [Language tutorial](TUTORIAL.md)
- [Language reference](REFERENCE.md)

### Compiling to OpenAPI

Once you've created your Responsible file, you can unlock all of the OpenAPI tooling:

```sh
bunx @responsibleapi/cli responsible.kdl -o /tmp/openapi.json
```

Below is some of the OpenAPI tooling provided by Responsible and third parties.

## Validating requests

### Typescript

#### [Hono](https://hono.dev)

See [packages/hono/README.md](packages/hono/README.md)

### Kotlin

#### [Vert.x](https://vertx.io)

Use the [built-in OpenAPI request validator](https://vertx.io/docs/vertx-openapi/java/#_validation_of_requests).

## Generating a client:

### Install

```sh
brew install openapi-generator
```

### Typescript

```sh
openapi-generator generate -g typescript-fetch -i /tmp/openapi.json -o gen/ --additional-properties=typescriptThreePlus=true,modelPropertyNaming=original,nullSafeAdditionalProps=true,enumPropertyNaming=original,supportsES6=true,useSingleRequestParameter=false
```

### Kotlin

```sh
openapi-generator generate -g kotlin -i /tmp/openapi.json -o gen/ --additional-properties=library=jvm-vertx
```

## Testing

The idea behind testing with OpenAPI is validating server responses against the contract.

### Kotlin

#### Vert.x

See https://github.com/responsibleapi/test-kotlin-vertx

### Python

To be published, see https://github.com/listenbox/yanic/blob/master/tests/responsible.py

### Typescript

#### Hono

![Responsible Hono version](https://img.shields.io/npm/v/@responsibleapi/hono)

```sh
bun install @responsibleapi/hono
```

```typescript
const responsible = new Responsible<keyof Handlers, AppEnv>(
  openApiInternal as oas31.OpenAPIObject,
  hono,
)

test("signup", async () => {
  await responsible.check("signup", {
    req: {
      body: {
        name: genStr(),
        email: genEmail(),
        password: genStr(),
      },
    },
    status: 201,
  })
})
```

## Fuzzing

Use https://schemathesis.io for now

```sh
brew install uv
uvx schemathesis run --checks all --base-url http://localhost:8080 --workers 40 src/main/resources/openapi.json
```

Ultimately the plan is to integrate fuzzing into the testing libraries.

## See also

- [OpenAPI](https://swagger.io/docs/specification/about/)
- [AWS Smithy](https://smithy.io/2.0/index.html)
- [API Blueprint](https://apiblueprint.org/)
- [WSDL](https://en.wikipedia.org/wiki/Web_Services_Description_Language/)
- [Protoforce](https://www.protoforce.io/)
- [Stoplight](https://stoplight.io/)
- [RAML](https://raml.org/)
