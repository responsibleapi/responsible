import { Schema } from "./schema"

interface Response {
  mime: string
  schema: Schema
}

const json = (schema: Schema): Response => ({
  schema,
  mime: "application/json",
})

type Responses = Record<number, Response>

type Endpoint =
  | {
      name: string
      method: "POST"
      requestBody: Schema
      responses: Responses
    }
  | {
      name: string
      method: "GET"
      responseBody: Schema
    }

interface Scope {
  scopes?: Record<string, Scope>
  paths?: Record<string, Endpoint>
  responses?: Responses
}

const err =

const paths: Record<string, Scope> = {
  "/japi": {
    scopes: {
      "/auth": {
        responses: {
          401: json()
        }
      }
    },
    paths: {
      "/login": {
        name: "requestOTP",
      }
    },
  },
}

export default {
  components: {
    securitySchemes: {
      JWTAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      }
    }
  }
}
