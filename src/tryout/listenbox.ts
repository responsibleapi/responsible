import {
  array,
  boolean,
  dateTime,
  email,
  external,
  hostname,
  httpURL,
  int32,
  mime,
  nat,
  newType,
  optional,
  seconds,
  string,
  stringEnum,
  struct,
  unknown,
  utcMillis,
} from "../dsl/schema"
import { Endpoints, Headers, scope, service } from "../dsl/endpoint"

const schemas = {
  ValidationExceptionErrorType: external(),

  FeedID: newType(string({ length: 11 })),

  ShowID: newType(string({ minLength: 11, maxLength: 12 })),

  ItemID: newType(string({ length: 11 })),

  ITunesCategory: struct({
    category: string({ minLength: 1 }),
    subcategory: optional(string({ minLength: 1 })),
  }),

  YouTubeFeedType: stringEnum("video", "playlist", "channel"),

  get Show() {
    return struct({
      id: this.ShowID,
      feed_id: this.FeedID,
      title: string(),
      image: optional(httpURL()),
      description: string(),
      author: optional(string()),
      copyright: optional(string()),
      keywords: optional(string()),
      website: optional(httpURL()),
      language: string(),
      explicit: optional(boolean()),
      owner: optional(string()),
      ownerEmail: optional(email()),
      primaryCategory: optional(this.ITunesCategory),
      secondaryCategory: optional(this.ITunesCategory),
      episodes: nat(),
      audioFeedURL: httpURL(),
      videoFeedURL: httpURL(),
      refreshedUTC: optional(utcMillis()),
      youtubeURL: httpURL(),
      analyticsPrefix: optional(httpURL()),
      reverse: optional(boolean()),
      type: this.YouTubeFeedType,
    })
  },

  get JsonItem() {
    return struct({
      id: this.ItemID,
      title: string(),
      image: optional(httpURL()),
      webpage_url: httpURL(),
      duration_seconds: optional(seconds()),
      mime: optional(mime()),
    })
  },

  get ItemsResp() {
    return struct({
      items: array(this.JsonItem),
      total: nat(),
    })
  },
} as const

const optionalAuthHeaders: Headers<typeof schemas> = {
  authorization: optional(string({ minLength: 1 })),
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
        updates: optional(boolean()),
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

  "/show/:show_id/items": {
    GET: {
      name: "getItems",
      params: { show_id: "ShowID" },
      query: {
        before: optional(dateTime()),
        limit: optional(nat({ minimum: 1 })),
      },
      res: {
        200: "ItemsResp",
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
          message: optional(string()),
          type: "ValidationExceptionErrorType",
        }),
      },
    },
  }),
})
