import {
  boolean,
  email,
  external,
  hostname,
  httpURL,
  int32,
  newType,
  string,
  stringEnum,
  struct,
  unknown,
} from "../dsl/schema"
import { Headers, scope, service } from "../dsl/endpoint"

const optionalAuthHeaders: Headers = {
  authorization: {
    type: string({ minLength: 1 }),
    optional: true,
  },
}

const ShowID = newType("ShowID", string({ minLength: 10, maxLength: 11 }))
const Show = struct("Show",{})

const japi: Parameters<typeof service>[1] = {
  "/login": {
    POST: {
      name: "requestOtp",
      req: struct("LoginReq", {
        email: email(),
        host: hostname(),
      }),
      res: {
        200: struct("LoginResp", { login: stringEnum("EXISTING", "NEW") }),
      },
    },
  },

  "/otp": {
    POST: {
      name: "submitOtp",
      req: struct("OtpReq", {
        email: email(),
        otp: string({ minLength: 1 }),
        updates: { type: boolean(), optional: true },
      }),
      res: {
        201: struct("OtpResp", {
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
        body: struct("SubmitReq", { url: httpURL() }),
      },
      res: {
        200: struct("SubmitResp", {
          showID: ShowID,
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
      params: { show_id: ShowID },
      reqHeaders: optionalAuthHeaders,
      res: {
        200: struct("Show", {}),
        403: unknown(),
        404: unknown(),
      },
    },
  },
}

export default service("listenbox", {
  "/japi": scope(japi, {
    req: { body: "application/json" },
    res: {
      body: "application/json",
      headers: {
        "content-length": int32({ minimum: 1 }),
      },
      codes: {
        400: struct("ErrorStruct", {
          name: string(),
          value: string(),
          message: { type: string(), optional: true },
          type: external<string>("ErrorType"),
        }),
      },
    },
  }),
})
