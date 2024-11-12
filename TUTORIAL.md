# Quick language tutorial

Responsible DSL is based on KDL language. Visit https://kdl.dev to learn more.

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

    scope "/:id(UserID)" {

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

<details>
<summary>Compiled OpenAPI JSON</summary>

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "User Management API",
    "version": "1.0.0"
  },
  "components": {
    "schemas": {
      "UserID": {
        "minLength": 1,
        "type": "string"
      },
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "$ref": "#/components/schemas/UserID"
          },
          "name": {
            "minLength": 1,
            "type": "string"
          }
        },
        "required": ["id", "name"]
      },
      "UserList": {
        "type": "object",
        "properties": {
          "users": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/User"
            }
          }
        },
        "required": ["users"]
      }
    }
  },
  "paths": {
    "/users": {
      "get": {
        "parameters": [],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserList"
                }
              }
            }
          }
        }
      },
      "post": {
        "parameters": [],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/User"
              }
            }
          },
          "required": true
        },
        "responses": {
          "201": {
            "description": "201",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/UserID"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "404": {
            "description": "404"
          }
        }
      },
      "put": {
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/UserID"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/User"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "404": {
            "description": "404"
          }
        }
      },
      "delete": {
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/UserID"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "204"
          },
          "404": {
            "description": "404"
          }
        }
      }
    }
  }
}
```

</details>
