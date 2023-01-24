# Responsible API

OpenAPI toolkit for enabling contract-first development.

## Why

### Problems OpenAPI solves

- Client & server team collaboration
- Server request validation
- Server response validation (e.g. https://schemathesis.io)
- Client generation (https://openapi-generator.tech, https://microsoft.github.io/kiota)
- Mock server generation
- Backwards compatibility verification
- Language and framework independence

### OpenAPI's problem: verbosity

- Frameworks like [FastAPI](https://fastapi.tiangolo.com) have a way to generate the spec from code, but you lose:

  - Client & server team collaboration (the spec is engraved in the server code)
  - Language and framework independence (more effort to get off the framework)

- [Stoplight](https://stoplight.io) simplifies OpenAPI management, but lacks coherence with the codebase,
  requiring synchronization between the spec and the code.

### Responsible DSL

Responsible builds on top of OpenAPI and solves the verbosity problem.

## Install

Homebrew

```shell
brew tap responsibleapi/responsible
brew install responsible
```

Or use the online editor https://responsibleapi.com

## Quick language tutorial

### Operations

Responsible's operation syntax is simple. Start with an HTTP method followed by a path:

```kdl
GET "/search" {

//  OpenAPI's `operationId`
    name "searchItems"

    req {
    // define request's query params
        query {
        // query param "q" & type=string
            q "string" minLength=1 {
                description "Search query"
            }
        // query param "next" & it's optional
            (?)next "string" format="uuid"
        }
    }

    res {
    // for 200 status code, the response body is a a JSON object with following fields
        "200" "application/json" "struct" {
        // field "results" & type=Array<string>
            results "array" "string"
        // field "next", type=UUID and it's optional
            (?)next "string" format="uuid"
        }

    // there is a 400 response, but it's shape is unknown (can be anything of any mime type)
        "400" "unknown"
    }
}
```

### Types

The `200` response struct can be extracted and named:

```kdl
// this a type alias
type "ItemID" "string" format="uuid"

// struct is type: "object" + "properties" + "required" in JsonSchema
struct "SearchResults" {
    results "array" "ItemID"
    (?)next "string" format="uuid"
}

GET "/search" {
    req {
        query {
            q "string" minLength=1
            (?)next "string" format="uuid"
        }
    }

    res {
        "200" "application/json" "SearchResults"
        "400" "unknown"
    }
}
```

### Operation wildcards

Now let's introduce a second operation: `getItem`:

```kdl
// this a type alias
type "ItemID" "string" format="uuid"

// path param "id" is of type `ItemID`
GET "/items/:id(ItemID)" {
    name "getItem"

    res {
        "200" "application/json" "Item"
        "400" "unknown"
    }
}
```

You can see that we have to repeat the `application/json` mime. We can fix that with an operation wildcard:

```kdl
// for any operation
* {
// in it's response
    res {
    // for any status code, the response body mime is `application/json`
        mime "application/json"
    }
}
```

And remove all the `application/json` mime from operations.

## Generating a client:

### Install

```shell
brew install openapi-generator
```

### Typescript

```shell
responsible file.kdl -o /tmp/out.json
openapi-generator generate -g typescript-fetch -i /tmp/out.json -o gen/ --additional-properties=typescriptThreePlus=true,modelPropertyNaming=original,nullSafeAdditionalProps=true,enumPropertyNaming=original,supportsES6=true,useSingleRequestParameter=false
```

### Kotlin

```shell
responsible file.kdl -o /tmp/out.json
openapi-generator generate -g kotlin -i /tmp/out.json -o gen/ --additional-properties=library=jvm-vertx
```

## API test assist

### Kotlin

See https://github.com/responsibleapi/test-kotlin-vertx

### Python

To be published

## API fuzzing

Use https://schemathesis.io for now

### Install

```shell
pip3 install schemathesis
```

### Run

```shell
st run --checks all --base-url http://localhost:8080 --workers 40 src/main/resources/openapi.json
```
