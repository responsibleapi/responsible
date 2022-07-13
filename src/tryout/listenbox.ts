import {
  boolean,
  email,
  external,
  hostname,
  httpURL,
  int32,
  newType,
  Optionality,
  Schema,
  SchemaRec,
  string,
  stringEnum,
  struct,
  unknown,
} from "../dsl/schema"
import { Endpoints, Headers, scope, service } from "../dsl/endpoint"

const schemas = {
  ShowID: newType(string({ minLength: 10, maxLength: 11 })),

  FeedID: newType(string({ minLength: 10, maxLength: 11 })),

  ITunesCategory: struct({
    category: string({ minLength: 1 }),
    subcategory: string({ minLength: 1, optional: true }),
  }),

  get Show() {
    return struct({
      id: this.ShowID,
      feed_id: this.FeedID,
      title: string(),
      image: httpURL({ optional: true }),
      description: string({ optional: true }),
      author: string({ optional: true }),
      copyright: string({ optional: true }),
      keywords: string({ optional: true }),
      website: httpURL({ optional: true }),
      language: string(),
      explicit: { type: boolean(), optional: true },
    })
  },
} as const

const optionalAuthHeaders: Headers<typeof schemas> = {
  authorization: {
    type: string({ minLength: 1 }),
    optional: true,
  },
}

const japi: Endpoints<typeof schemas> = {
  "/login": {
    POST: {
      name: "requestOtp",
      req: struct({
        email: email(),
        host: hostname(),
      }),
      res: {
        200: struct({
          login: stringEnum("EXISTING", "NEW"),
        }),
      },
    },
  },

  "/otp": {
    POST: {
      name: "submitOtp",
      req: struct({
        email: email(),
        otp: string({ minLength: 1 }),
        updates: { type: boolean(), optional: true },
      }),
      res: {
        201: struct({
          jwt: string({ minLength: 1 }),
        }),
        401: unknown(),
      },
    },
  },

  "/submit": {
    POST: {
      name: "submitUrl",
      req: {
        headers: optionalAuthHeaders,
        body: struct({ url: httpURL() }),
      },
      res: {
        200: struct({
          showID: "ShowID",
          plan: stringEnum("free", "basic", "creator"),
        }),
        400: unknown(),
        401: unknown(),
        404: unknown(),
      },
    },
  },

  "/show/:show_id": {
    GET: {
      name: "getShow",
      params: { show_id: "ShowID" },
      reqHeaders: optionalAuthHeaders,
      res: {
        200: "Show",
        403: unknown(),
        404: unknown(),
      },
    },
  },
}

export default service("listenbox", schemas, {
  "/japi": scope(japi, {
    req: { body: "application/json" },
    res: {
      body: "application/json",
      headers: {
        "content-length": int32({ minimum: 1 }),
      },
      codes: {
        400: struct({
          name: string(),
          value: string(),
          message: { type: string(), optional: true },
          type: external(),
        }),
      },
    },
  }),
})
