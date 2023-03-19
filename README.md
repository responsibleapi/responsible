# Responsible API

Responsible API was created to:

- Provide a concise syntax to overcome OpenAPI complexity and verbosity
- Enable Contract Tests for reliable and consistent APIs
- Allow for tight integration within the development process using version control systems like Git,
  unlike [stoplight.io](https://stoplight.io/)
- Offer language and framework independence, unlike [FastAPI](https://fastapi.tiangolo.com/), for reusability,
  adaptability, and flexibility in technology choices.

## Install

Homebrew

```shell
brew tap responsibleapi/responsible
brew install responsible
```

Or use the online editor https://responsibleapi.com

## Quick language tutorial

Responsible DSL is based on KDL language. Visit https://kdl.dev to learn more

[Browse examples](examples/).

In this quick tutorial, we'll show you how to create a simple Responsible API document for a basic user management
system. Responsible API documents consist of various elements such as types, structs, and endpoints.

```kdl
responsible syntax=1

info {
    title "User Management API"
    version "1.0.0"
}

type "UserID" "string" minLength=1

struct "User" {
    id "UserID"
    name "string" minLength=1
}

struct "UserList" {
    users "array" "User"
}

* {
    req {
        mime "application/json"
    }

    res {
        mime "application/json"
    }
}

scope "/users" {

    GET {
        res {
            "200" "UserList"
        }
    }

    POST {
        req "User"

        res {
            "201" "User"
        }
    }
}

scope "/users/:id(UserID)" {

    * {
        res {
            "404" "unknown"
        }
    }

    GET {
        res {
            "200" "User"
        }
    }

    PUT {
        req "User"
        res {
            "200" "User"
        }
    }

    DELETE {
        res {
            "204" "unknown"
        }
    }
}
```

1. Start by defining the document's metadata with the `info` block.
2. Create custom types and structures for the API using the `type` and `struct` keywords.
3. The `*` block sets up common request and response attributes applied to all endpoints.
4. Define your API endpoints using HTTP methods like `GET`, `POST`, `PUT`, and `DELETE`.
5. Inside each endpoint, specify the request and response properties, such as path parameters, query parameters, and
   response status codes.

Once you've written the Responsible API document, you can compile it into an OpenAPI JSON file, which can be used for
generating documentation, client libraries, and server stubs, as well as performing Contract Tests.

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
