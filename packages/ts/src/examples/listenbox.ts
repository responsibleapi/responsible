import { responsibleAPI } from "../dsl/dsl.ts"
import { GET, HEAD, POST } from "../dsl/methods.ts"
import { resp } from "../dsl/operation.ts"
import {
  array,
  boolean,
  dict,
  int32,
  int64,
  object,
  string,
  unknown,
} from "../dsl/schema.ts"
import { scope } from "../dsl/scope.ts"
import { headerSecurity } from "../dsl/security.ts"

const Email = string({ format: "email" })

const ShowID = () => string({ minLength: 11, maxLength: 12 })
const FeedID = () => string({ minLength: 11, maxLength: 11 })
const ItemID = () => string({ minLength: 11, maxLength: 11 })

const HttpURL = string({
  format: "uri",
  pattern: /^https?:\/\/\S+$/,
})

const SubmitReq = () => object({ url: HttpURL })

const UrlResp = () => object({ url: HttpURL })

const Plan = () => string({ enum: ["free", "basic", "creator"] })

const AudioVideo = () => string({ enum: ["audio", "video"] })

const StripeCheckoutID = () => string({ minLength: 1 })

const UserResp = () =>
  object({
    email: Email,
    plan: Plan,
    trialed: boolean(),
    updates: boolean(),
  })

const UnixMillis = int64({})

const RecentResp = () =>
  object({
    list: array(
      object({
        id: ShowID,
        feed_id: FeedID,
        title: string(),
        episodes: int32({ minimum: 0 }),
        "image?": HttpURL,
        "refreshed_utc?": UnixMillis,
        "author?": string(),
        "owner?": string(),
      }),
      { minItems: 0 },
    ),
    plan: Plan,
  })

const ErrorStruct = () =>
  object({
    type: string({ minLength: 1 }),
    message: string({ minLength: 1 }),
    "causeType?": string({ minLength: 1 }),
    "causeMessage?": string({ minLength: 1 }),
  })

const ITunesCategory = () =>
  object({
    category: string({ minLength: 1 }),
    "subcategory?": string({ minLength: 1 }),
  })

const YouTubeFeedType = () => string({ enum: ["video", "playlist", "channel"] })

const Show = () =>
  object({
    "analyticsPrefix?": HttpURL,
    "author?": string(),
    "copyright?": string(),
    "explicit?": boolean(),
    "image?": HttpURL,
    "keywords?": string(),
    "owner?": string(),
    "ownerEmail?": Email,
    "primaryCategory?": ITunesCategory,
    "refreshedUTC?": UnixMillis,
    "reverse?": boolean(),
    "secondaryCategory?": ITunesCategory,
    "type?": YouTubeFeedType,
    "website?": HttpURL,
    audioFeedURL: HttpURL,
    description: string(),
    episodes: int32({ minimum: 0 }),
    feed_id: FeedID,
    id: ShowID,
    language: string(),
    title: string(),
    videoFeedURL: HttpURL,
    youtubeURL: HttpURL,
  })

const PaginationResp = () =>
  object({
    "hasBefore?": boolean({
      deprecated: true,
      description: "newBefore is enough",
    }),
    "hasAfter?": boolean({
      deprecated: true,
      description: "newAfter is enough",
    }),
    "newBefore?": ItemID,
    "newAfter?": ItemID,
  })

const Show2 = () =>
  object({
    show: Show,
    items: array(JsonItem),
    "user?": UserResp,
    pagination: PaginationResp,
  })

const EditShowReq = () =>
  object({
    "analyticsPrefix?": HttpURL,
    "author?": string(),
    "category1?": string(),
    "category2?": string(),
    "copyright?": string(),
    "description?": string(),
    explicit: boolean(),
    "image?": HttpURL,
    "keywords?": string(),
    language: string(),
    owner: string(),
    ownerEmail: Email,
    "subcategory1?": string(),
    "subcategory2?": string(),
    "title?": string(),
    "website?": HttpURL,
  })

const Mime = string({ pattern: /^[a-z]+\/.+$/ })

const JsonItem = () =>
  object({
    id: ItemID,
    title: string(),
    webpage_url: HttpURL,
    pub_date_utc: UnixMillis,
    audio_url: HttpURL,
    mime: Mime,
    "duration_seconds?": int64(),
    "image?": HttpURL,
    "author?": string(),
  })

const ItemsResp = () =>
  object({
    items: array(JsonItem, { minItems: 0 }),
    total: int32({ minimum: 0 }),
  })

const ItemsResp2 = () =>
  object({
    items: array(JsonItem, { minItems: 0 }),
    pagination: PaginationResp,
  })

const LoginReq = () =>
  object({
    email: Email,
    host: string({ minLength: 1 }),
  })

const AuthorizationHeader = () => headerSecurity({ name: "authorization" })

const WorkerEvent = () =>
  object({
    url: HttpURL,
    headers: dict(string(), string()),
    timestamp: UnixMillis,
  })

const PlanInterval = () => string({ enum: ["month", "year"] })

const DownloadsChart = () =>
  object({
    list: array(
      object({
        day: UnixMillis,
        downloads: int32({ minimum: 0 }),
      }),
      { minItems: 0 },
    ),
    total: int64({ minimum: 0 }),
  })

const UpgradeToAddMoreToListenLater = resp({ description: "402" })

const PreSignedUploadURL = () =>
  object({
    fileUrl: HttpURL,
    uploadUrl: HttpURL,
    headers: dict(string(), string()),
  })

const ReverseReq = () => object({ showID: ShowID, value: boolean() })

const ReverseResp = () => object({ value: boolean() })

const NotYourShow = resp({ description: "403" })

const authenticatedOps = scope({
  forEachOp: {
    req: {
      security: AuthorizationHeader,
    },
    res: {
      add: {
        401: resp({ description: "401" }),
      },
    },
  },
  "/unsubscribe": POST({
    id: "unsubscribe",
    description: "Unsubscribe the email from product updates",
    req: object({ email: Email }),
    res: { 200: unknown() },
  }),
  "/user": scope({
    GET: {
      id: "getUser",
      res: { 200: UserResp },
    },
    /** Why is this a POST */
    POST: {
      id: "patchUser",
      req: object({ updates: boolean() }),
      res: { 200: UserResp },
    },
    DELETE: {
      id: "deleteUser",
      res: { 200: unknown() },
    },
    "/:email/shows": GET({
      id: "showsByEmail",
      req: { pathParams: { email: Email } },
      res: {
        200: array(
          object({
            id: ShowID,
            title: string({ minLength: 1 }),
          }),
        ),
      },
    }),
  }),
  "/recent": GET({
    id: "recentFeeds",
    res: { 200: RecentResp },
  }),
  "/checkout": POST({
    id: "stripeCheckout",
    description:
      "Redirect to the checkout page or to billing if already subscribed",
    req: object({
      plan: Plan,
      interval: PlanInterval,
      success_url: HttpURL,
      cancel_url: HttpURL,
    }),
    res: { 201: UrlResp },
  }),
  "/billing": POST({
    id: "stripeBilling",
    req: object({ return_url: HttpURL }),
    res: { 201: UrlResp },
  }),
  "/show/:show_id": scope({
    forEachOp: {
      req: {
        pathParams: { show_id: ShowID },
      },
      res: {
        add: {
          403: NotYourShow,
          404: resp({ description: "404" }),
        },
      },
    },
    PUT: {
      id: "editShow",
      req: EditShowReq,
      res: { 200: Show },
    },
    DELETE: {
      id: "deleteFeed",
      res: { 200: unknown() },
    },
    "/downloads": GET({
      id: "getDownloads",
      req: {
        query: {
          "timezone?": string({ minLength: 1 }),
        },
      },
      res: { 200: DownloadsChart },
    }),
    "/episode_downloads": GET({
      id: "episodeDownloads",
      res: {
        200: array(
          object({
            title: string(),
            url: HttpURL,
            downloads: int32({ minimum: 0 }),
          }),
        ),
      },
    }),
  }),
  "/later": scope({
    GET: {
      id: "getLater",
      deprecated: true,
      res: { 200: Show },
    },
    POST: {
      id: "submitLater",
      req: SubmitReq,
      res: {
        200: Show,
        402: UpgradeToAddMoreToListenLater,
        403: NotYourShow,
      },
    },
    "/v2/v2": GET({
      id: "getLater2",
      req: {
        query: {
          "before?": ItemID,
          "after?": ItemID,
        },
      },
      res: { 200: Show2 },
    }),
    "/:item_id": scope({
      forEachOp: {
        req: {
          pathParams: { item_id: ItemID },
        },
      },
      POST: {
        id: "addLater",
        res: {
          200: unknown(),
          402: UpgradeToAddMoreToListenLater,
        },
      },
      DELETE: {
        id: "removeLater",
        res: { 200: unknown() },
      },
    }),
  }),
  "/s3_presign_image": GET({
    id: "preSignedImageUploadURL",
    req: {
      query: {
        filename: string({ minLength: 1 }),
      },
    },
    res: {
      200: PreSignedUploadURL,
      402: resp({ description: "402" }),
    },
  }),
  "/reverse": POST({
    id: "reversePlaylist",
    req: ReverseReq,
    res: {
      200: ReverseResp,
      403: NotYourShow,
    },
  }),
})

const jsonAPI = scope({
  forEachOp: {
    req: {
      mime: "application/json",
    },
    res: {
      defaults: {
        "200..299": {
          mime: "application/json",
          headers: { "content-length": int32({ minimum: 1 }) },
        },
      },
    },
  },
  "/login": POST({
    id: "requestOtp",
    req: LoginReq,
    res: {
      200: object({
        login: string({ enum: ["NEW", "EXISTING"] }),
      }),
    },
  }),
  "/otp": POST({
    id: "submitOtp",
    req: object({
      email: Email,
      otp: string({ minLength: 1 }),
      "updates?": boolean(),
    }),
    res: {
      201: object({
        jwt: string({ minLength: 1 }),
      }),
      401: {
        description: "Incorrect OTP",
      },
    },
  }),
  "/submit": POST({
    id: "submitUrl",
    req: {
      "security?": AuthorizationHeader,
      body: SubmitReq,
    },
    res: {
      200: object({
        showID: ShowID,
        "plan?": Plan,
      }),
      401: {
        description: "Submitting playlists requires a login",
      },
      403: {
        description: "403",
      },
      404: unknown(),
    },
  }),
  "/show/:show_id": scope({
    forEachOp: {
      req: {
        pathParams: { show_id: ShowID },
      },
      res: {
        add: {
          404: resp({ description: "404" }),
        },
      },
    },
    GET: {
      deprecated: true,
      id: "getShow",
      res: { 200: Show },
    },
    "/v2": GET({
      id: "getShow2",
      req: {
        "security?": AuthorizationHeader,
        query: {
          "before?": ItemID,
          "after?": ItemID,
        },
      },
      res: { 200: Show2 },
    }),
    "/items2": GET({
      id: "getItems2",
      req: {
        query: {
          "before?": ItemID,
          "after?": ItemID,
        },
      },
      res: { 200: ItemsResp2 },
    }),
    "/items": GET({
      id: "getItems",
      deprecated: true,
      req: {
        query: {
          "before?": string({ format: "date-time" }),
          "limit?": int32({ minimum: 1 }),
        },
      },
      res: { 200: ItemsResp },
    }),
  }),
  "/cdn_log": POST({
    id: "logCDN",
    req: {
      body: {
        "application/json": WorkerEvent,
        /** Workaround for a current worker to avoid redeploying it 😏 */
        "text/plain": WorkerEvent,
      },
    },
    res: {
      201: {
        headers: {
          /** Wtf is this */
          "content-length?": int32({ minimum: 0, maximum: 0 }),
        },
      },
    },
  }),
  "/auth": authenticatedOps,
})

const googleAuth = scope({
  GET: {
    id: "googleSlash",
    res: {
      302: {
        description: "302",
        headers: {
          location: HttpURL,
        },
      },
    },
  },

  "/callback": GET({
    id: "googleCallback",
    req: {
      query: {
        code: string({ minLength: 1 }),
      },
    },
    res: {
      302: {
        description: "302",
        headers: {
          location: HttpURL,
        },
        cookies: {
          token: string({ minLength: 1 }),
        },
      },
    },
  }),
})

const RedirectRSS = resp({
  description: "302",
  headers: {
    location: HttpURL,
  },
})

const NonEmptyString = () =>
  string({
    minLength: 1,
  })

const ItemNotFound = resp({
  description: "404",
})

export default responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "Listenbox",
      version: "0.1",
      termsOfService: "https://listenbox.app/terms",
    },
    servers: [
      { url: "https://api.listenbox.app" },
      { url: "http://localhost:8080" },
    ],
  },
  forEachOp: {
    res: {
      add: {
        400: {
          headers: { "content-length": int32({ minimum: 1 }) },
          body: { "application/json": ErrorStruct },
        },
      },
    },
  },
  missingSchemas: [StripeCheckoutID],
  routes: {
    "/api/health": GET({
      id: "getHealth",
      headID: "headHealth",
      res: { 200: resp({ description: "200" }) },
    }),

    "/status/info": HEAD({
      id: "infoStatus",
      req: {
        query: {
          url: HttpURL,
        },
      },
      res: {
        200: resp({ description: "200" }),
        500: resp({ description: "500" }),
      },
    }),

    "/status/download": HEAD({
      id: "downloadStatus",
      req: {
        query: {
          url: HttpURL,
        },
      },
      res: {
        200: resp({ description: "200" }),
        500: resp({ description: "500" }),
      },
    }),

    "/japi": jsonAPI,

    "/oauth/google": googleAuth,

    "/rss/:show_id/:type.rss": GET({
      id: "getRss",
      headID: "headRss",
      req: {
        pathParams: {
          show_id: ShowID,
          type: AudioVideo,
        },
      },
      res: {
        200: {
          headers: {
            "content-length": int32({ minimum: 1 }),
            etag: string({ minLength: 1 }),
            "cache-control": string({ const: "no-cache" }),
            "cdn-cache-control": string({ const: "max-age=2147483647" }),
            "last-modified?": string({ minLength: 1 }),
          },
          body: {
            "application/rss+xml": string({ minLength: 1 }),
          },
        },
        302: RedirectRSS,
        403: resp({ description: "403" }),
        404: resp({ description: "404" }),
      },
    }),

    "/a/:item_id.:ext": GET({
      id: "getAudio",
      headID: "headAudio",
      req: {
        pathParams: {
          item_id: ItemID,
          ext: NonEmptyString,
        },
        headers: {
          "cf-connecting-ip?": string({ minLength: 1 }),
        },
      },
      res: {
        200: {
          headers: {
            "cache-control": string({ minLength: 1 }),
            "content-length": int32({ minimum: 1 }),
          },
          body: {
            "audio/*": string({ format: "binary" }),
          },
        },
        404: ItemNotFound,
        429: resp({ description: "429" }),
        503: resp({ description: "503" }),
      },
    }),

    "/w/:item_id.:ext": GET({
      id: "getVideo",
      headID: "headVideo",
      req: {
        pathParams: {
          item_id: ItemID,
          ext: NonEmptyString,
        },
        headers: {
          "cf-connecting-ip?": string({ minLength: 1 }),
        },
      },
      res: {
        302: {
          headers: {
            location: HttpURL,
            "cache-control": string({ minLength: 1 }),
          },
        },
        404: ItemNotFound,
        429: resp({ description: "429" }),
      },
    }),

    "/stripe/hooks": POST({
      id: "stripeWebhook",
      req: {
        headers: {
          "stripe-signature": string({ minLength: 1 }),
        },
        body: {
          "application/json": object(),
        },
      },
      res: {
        200: unknown(),
      },
    }),

    "/youtube/hooks": scope({
      GET: {
        id: "verifyYouTubeHook",
        req: {
          query: {
            "hub.challenge?": string({ minLength: 1 }),
            "hub.lease_seconds?": int32({ minimum: 1 }),
          },
        },
        res: {
          200: resp({ description: "200" }),
        },
      },

      POST: {
        id: "postYouTubeHook",
        req: {
          headers: {
            link: string({ minLength: 1 }),
          },
          body: {
            "*/*": unknown(),
          },
        },
        res: {
          200: unknown(),
        },
      },
    }),
  },
})
