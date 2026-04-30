import { responsibleAPI } from "../dsl/dsl.ts"
import { POST } from "../dsl/methods.ts"
import {
  array,
  dict,
  email,
  int32,
  int64,
  object,
  string,
} from "../dsl/schema.ts"

const PostID = () => int64({ minimum: 1 })

const UserID = () => int64({ minimum: 1 })

export const UnixMillis = () =>
  int64({ description: "UNIX epoch milliseconds" })

const Post = () =>
  object({
    id: PostID,
    user_id: UserID,
    content: string({ minLength: 1 }),
    created_at: UnixMillis,
    updated_at: UnixMillis,
  })

const NewPost = () =>
  object({
    email: email(),
    content: string({ minLength: 1 }),
  })

export default responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "HTTP benchmarks",
      version: "1",
    },
  },
  forEachOp: {
    req: { mime: "application/json" },
    res: {
      defaults: {
        "100..599": {
          mime: "application/json",
          headers: { "Content-Length": int32({ minimum: 1 }) },
        },
      },
      add: {
        400: dict(
          string({ minLength: 1 }),
          array(string({ minLength: 1 }), { minItems: 1 }),
        ),
      },
    },
  },
  routes: {
    "/posts": POST("newPost", {
      req: NewPost,
      res: {
        201: Post,
      },
    }),
    "/echo": POST("echo", {
      req: NewPost,
      res: {
        200: Post,
      },
    }),
  },
})
