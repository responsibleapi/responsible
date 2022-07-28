import {
  array,
  boolean,
  dateTime,
  dict,
  email,
  external,
  hostname,
  httpURL,
  int32,
  mime,
  nat32,
  nat64,
  newType,
  optional,
  seconds,
  string,
  stringEnum,
  struct,
  unknown,
  utcMillis,
} from "../dsl/schema"
import { Endpoints, scope, service } from "../dsl/endpoint"

const schemas = {
  FeedID: newType(string({ length: 11 })),

  ShowID: newType(string({ minLength: 11, maxLength: 12 })),

  ItemID: newType(string({ length: 11 })),

  StripeCheckoutID: newType(string({ minLength: 1 })),

  SubmitReq: struct({
    url: httpURL(),
  }),

  Plan: stringEnum("free", "basic", "creator"),

  UserResp: struct({
    plan: "Plan",
    trialed: boolean(),
    email: email(),
    updates: boolean(),
  }),

  RecentResp: struct({
    list: array(
      struct({
        id: "ShowID",
        feed_id: "FeedID",
        title: string(),
        image: optional(httpURL()),
        refreshed_utc: optional(utcMillis()),
        author: optional(string()),
        owner: optional(string()),
        episodes: nat32(),
      }),
    ),
    plan: "Plan",
  }),

  ValidationExceptionErrorType: external(),

  ITunesCategory: struct({
    category: string({ minLength: 1 }),
    subcategory: optional(string({ minLength: 1 })),
  }),

  YouTubeFeedType: stringEnum("video", "playlist", "channel"),

  Show: struct({
    id: "ShowID",
    feed_id: "FeedID",
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
    primaryCategory: optional("ITunesCategory"),
    secondaryCategory: optional("ITunesCategory"),
    episodes: nat32(),
    audioFeedURL: httpURL(),
    videoFeedURL: httpURL(),
    refreshedUTC: optional(utcMillis()),
    youtubeURL: httpURL(),
    analyticsPrefix: optional(httpURL()),
    reverse: optional(boolean()),
    type: "YouTubeFeedType",
  }),

  EditShowReq: struct({
    title: optional(string()),
    image: optional(httpURL()),
    description: optional(string()),
    author: optional(string()),
    copyright: optional(string()),
    keywords: optional(string()),
    website: optional(httpURL()),
    language: string(),
    explicit: boolean(),
    owner: string(),
    ownerEmail: email(),
    category1: optional(string()),
    subcategory1: optional(string()),
    category2: optional(string()),
    subcategory2: optional(string()),
    analyticsPrefix: optional(httpURL()),
  }),

  JsonItem: struct({
    id: "ItemID",
    title: string(),
    image: optional(httpURL()),
    webpage_url: httpURL(),
    duration_seconds: optional(seconds()),
    mime: optional(mime()),
  }),

  ItemsResp: struct({
    items: array("JsonItem"),
    total: nat32(),
  }),

  PreSignedUploadURL: struct({
    fileUrl: httpURL(),
    uploadUrl: httpURL(),
    headers: dict(string(), string()),
  }),

  DownloadsChart: struct({
    list: array(
      struct({
        day: utcMillis(),
        downloads: nat32(),
      }),
    ),
    total: nat64(),
  }),

  ReverseReq: struct({
    showID: "ShowID",
    value: boolean(),
  }),

  ReverseResp: struct({
    value: boolean(),
  }),
} as const

const optionalAuthHeaders = {
  authorization: optional(string({ minLength: 1 })),
} as const

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
      headers: optionalAuthHeaders,
      req: "SubmitReq",
      res: {
        200: struct({
          showID: "ShowID",
          plan: "Plan",
        }),
        400: unknown(),
        401: unknown(),
        404: unknown(),
      },
    },
  },

  "/show/:show_id": {
    params: { show_id: "ShowID" },

    GET: {
      name: "getShow",
      headers: optionalAuthHeaders,
      res: {
        200: "Show",
        403: unknown(),
        404: unknown(),
      },
    },
  },

  "/show/:show_id/items": {
    params: { show_id: "ShowID" },

    GET: {
      name: "getItems",
      query: {
        before: optional(dateTime()),
        limit: optional(nat32({ minimum: 1 })),
      },
      res: {
        200: "ItemsResp",
        404: unknown(),
      },
    },
  },

  "/unsubscribe": {
    POST: {
      name: "unsubscribe",
      req: struct({ email: email() }),
      res: { 200: unknown() },
    },
  },

  "/auth": scope(
    {
      "/user": {
        GET: {
          name: "getUser",
          res: { 200: "UserResp" },
        },
        POST: {
          name: "patchUser",
          req: struct({ updates: boolean() }),
          res: { 200: "UserResp" },
        },
        DELETE: {
          name: "deleteUser",
          res: { 200: "UserResp" },
        },
      },

      "/recent": {
        GET: {
          name: "recentFeeds",
          res: { 200: "RecentResp" },
        },
      },

      "/checkout": {
        POST: {
          name: "checkout",
          req: struct({
            interval: stringEnum("month", "year"),
            plan: "Plan",
            success_url: httpURL(),
            cancel_url: httpURL(),
          }),
          res: {
            201: struct({
              id: newType(string({ minLength: 1 })),
            }),
            409: unknown(),
          },
        },
      },

      "/portal": {
        POST: {
          name: "customerPortal",
          req: struct({ return_url: httpURL() }),
          res: { 201: struct({ url: httpURL() }) },
        },
      },

      "/later": {
        GET: {
          name: "getLater",
          res: {
            200: "Show",
            404: unknown(),
          },
        },
        POST: {
          name: "submitLater",
          req: "SubmitReq",
          res: {
            200: "ItemsResp",
            402: unknown(),
          },
        },
      },

      "/later/:item_id": {
        params: { item_id: "ItemID" },

        POST: {
          req: unknown(),
          name: "addLater",
          res: { 200: unknown(), 402: unknown() },
        },
        DELETE: {
          name: "removeLater",
          res: { 200: unknown() },
        },
      },

      "/feed/:show_id": {
        params: { show_id: "ShowID" },

        DELETE: {
          name: "deleteFeed",
          res: { 200: unknown() },
        },
      },

      "/s3_presign_image": {
        GET: {
          name: "preSignedImageUploadURL",
          query: { filename: string({ minLength: 1 }) },
          res: {
            200: "PreSignedUploadURL",
            402: unknown(),
          },
        },
      },

      "/show/:show_id": {
        params: { show_id: "ShowID" },

        PUT: {
          name: "editShow",
          req: "EditShowReq",
          res: { 200: "Show", 403: unknown(), 404: unknown() },
        },
      },

      "/show/:show_id/downloads": {
        params: { show_id: "ShowID" },

        GET: {
          name: "getDownloads",
          query: { timezone: optional(string({ minLength: 1 })) },
          res: {
            200: "DownloadsChart",
            403: unknown(),
          },
        },
      },

      "/reverse": {
        POST: {
          name: "reversePlaylist",
          req: "ReverseReq",
          res: {
            200: "ReverseResp",
            403: unknown(),
          },
        },
      },
    },
    {
      req: {
        headers: {
          authorization: string({ minLength: 1 }),
        },
      },
      res: {
        codes: {
          401: unknown(),
        },
      },
    },
  ),
}

export default service(
  {
    title: "listenbox",
    version: "1.0.0",
  },
  schemas,
  {
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
  },
)
