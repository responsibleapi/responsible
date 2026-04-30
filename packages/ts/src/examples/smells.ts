import { responsibleAPI } from "../dsl/dsl.ts"
import { POST } from "../dsl/methods.ts"
import { float, int32, object, string, unknown } from "../dsl/schema.ts"

const LatLng = () =>
  object({
    longitude: float({ minimum: -180, maximum: 180 }),
    latitude: float({ minimum: -90, maximum: 90 }),
  })

const GeoBBox = () =>
  object({
    min: LatLng,
    max: LatLng,
  })

const NewSmell = () =>
  object({
    location: LatLng,
  })

const GeoJSON = () => unknown()

const SmellMap = () =>
  object({
    geoJSON: GeoJSON,
  })

const Err = () =>
  object({
    message: string({ minLength: 1 }),
  })

// noinspection JSUnusedGlobalSymbols
export default responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "HTTP benchmarks",
      version: "1",
    },
  },
  forEachOp: {
    req: {
      mime: "application/json",
    },
    res: {
      defaults: {
        "100..499": {
          mime: "application/json",
          headers: { "Content-Length": int32({ minimum: 1 }) },
        },
      },
      add: {
        400: {
          body: Err,
        },
      },
    },
  },
  routes: {
    "/smells": POST({
      req: {
        headers: {
          Authorization: string({ pattern: /^Bearer \S+$/ }),
        },
        body: NewSmell,
      },
      res: {
        201: {
          body: object({}),
        },
      },
    }),
    "/map": POST({
      req: GeoBBox,
      res: {
        200: SmellMap,
      },
    }),
  },
})
