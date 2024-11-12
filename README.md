# ResponsibleAPI

A small language that compiles to OpenAPI 3.1.0.

Responsible is based on [KDL 1.0.0](https://kdl.dev).

- [Examples](examples/)
- [Tutorial](TUTORIAL.md)
- [Language reference](REFERENCE.md)

## Generating a client:

### Install

```sh
brew install openapi-generator
```

### Typescript

```sh
bunx @responsibleapi/cli file.kdl -o /tmp/openapi.json
openapi-generator generate -g typescript-fetch -i /tmp/openapi.json -o gen/ --additional-properties=typescriptThreePlus=true,modelPropertyNaming=original,nullSafeAdditionalProps=true,enumPropertyNaming=original,supportsES6=true,useSingleRequestParameter=false
```

### Kotlin

```sh
bunx @responsibleapi/cli file.kdl -o /tmp/openapi.json
openapi-generator generate -g kotlin -i /tmp/openapi.json -o gen/ --additional-properties=library=jvm-vertx
```

## Testing

The idea behind testing with OpenAPI is validating server responses against the contract.

### Kotlin

See https://github.com/responsibleapi/test-kotlin-vertx

### Python

To be published, see https://github.com/listenbox/yanic/blob/master/tests/responsible.py

### Javascript

To be published

## Fuzzing

Use https://schemathesis.io for now

```sh
pipx install schemathesis
st run --checks all --base-url http://localhost:8080 --workers 40 src/main/resources/openapi.json
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
