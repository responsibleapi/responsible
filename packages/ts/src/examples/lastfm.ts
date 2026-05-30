import { responsibleAPI } from "../dsl/dsl.ts"

export default responsibleAPI({
  partialDoc: {
    openapi: "3.0.3",
    info: {
      title: "Last.fm Web Services API (2.0)",
      version: "2.0",
      description: `The Last.fm (AudioScrobbler) Web Services 2.0 API provides programmatic access to
music metadata, charts, geo-listening data, tags, user listening history, and
scrobbling. The API is method-dispatched: every request targets the single endpoint
https://ws.audioscrobbler.com/2.0/ and identifies the operation via the method
query/body parameter (e.g. method=track.getInfo).

Read methods accept GET; write methods (scrobbling, tagging, love/unlove, session
management) require POST with an authenticated session key and a signed
api_sig parameter (MD5 of sorted params + shared secret).

Responses default to XML; pass format=json for JSON.`,
      termsOfService: "https://www.last.fm/api/tos",
      contact: {
        name: "Last.fm API Support",
        url: "https://www.last.fm/api",
        email: "partners@last.fm",
      },
      license: {
        name: "Last.fm API Terms of Service",
        url: "https://www.last.fm/api/tos",
      },
    },
    servers: [
      {
        url: "https://ws.audioscrobbler.com/2.0",
        description: "Production AudioScrobbler endpoint",
      },
      {
        url: "http://ws.audioscrobbler.com/2.0",
        description: "Non-TLS endpoint (legacy)",
      },
    ],
  },
  routes: {},
})
