import { describe, expect, test } from "vitest"

import { validateSchema, validates } from "../help/validate-schema.ts"
import {
  allOf,
  anyOf,
  array,
  boolean,
  dict,
  double,
  isoDuration,
  email,
  float,
  httpURL,
  int32,
  int64,
  integer,
  nullable,
  number,
  object,
  oneOf,
  string,
  uint32,
  uint64,
  unixMillis,
  unknown,
} from "./schema.ts"

describe("schema", () => {
  test("array", () => {
    const schema = array(string(), {
      minItems: 1,
      maxItems: 3,
      examples: [["a"]],
    })

    expect(validateSchema(schema)).toEqual({
      type: "array",
      items: {
        type: "string",
      },
      minItems: 1,
      maxItems: 3,
      examples: [["a"]],
    })
  })

  test("dict", () => {
    const schema = dict(string({ minLength: 1 }), int32({ minimum: 0 }), {
      description: "Localized values by language code",
      deprecated: true,
      examples: [{ en: 1 }],
    })

    expect(validateSchema(schema)).toEqual({
      type: "object",
      propertyNames: {
        type: "string",
        minLength: 1,
      },
      additionalProperties: {
        type: "integer",
        format: "int32",
        minimum: 0,
      },
      description: "Localized values by language code",
      deprecated: true,
      examples: [{ en: 1 }],
    })
  })

  test("dict omits default string propertyNames", () => {
    const schema = dict(string(), int32({ minimum: 0 }))

    expect(validateSchema(schema)).toEqual({
      type: "object",
      additionalProperties: {
        type: "integer",
        format: "int32",
        minimum: 0,
      },
    })
  })

  test("object", () => {
    const schema = object(
      {
        title: string(),
        "subtitle?": string(),
      },
      {
        description: "Article metadata",
        deprecated: true,
      },
    )

    expect(validateSchema(schema)).toEqual({
      description: "Article metadata",
      deprecated: true,
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        subtitle: {
          type: "string",
        },
      },
      required: ["title"],
    })
  })

  test("object with optional property names omits required", () => {
    const schema = object({
      "title?": string(),
      "subtitle?": string(),
    })

    expect(validateSchema(schema)).toEqual({
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        subtitle: {
          type: "string",
        },
      },
    })
  })

  test("int64", () => {
    const schema = int64({
      minimum: 1,
      maximum: 10,
      examples: [4],
    })

    expect(validateSchema(schema)).toEqual({
      type: "integer",
      format: "int64",
      minimum: 1,
      maximum: 10,
      examples: [4],
    })
  })

  test("int32", () => {
    const schema = int32({
      minimum: 1,
      maximum: 10,
      examples: [4],
    })

    expect(validateSchema(schema)).toEqual({
      type: "integer",
      format: "int32",
      minimum: 1,
      maximum: 10,
      examples: [4],
    })
  })

  test("integer", () => {
    const schema = integer({
      minimum: 1,
      maximum: 10,
      examples: [4],
    })

    expect(validateSchema(schema)).toEqual({
      type: "integer",
      minimum: 1,
      maximum: 10,
      examples: [4],
    })
  })

  test("uint64", () => {
    const schema = uint64({
      minimum: 1,
      maximum: 10,
      examples: [4],
    })

    expect(validateSchema(schema)).toEqual({
      type: "integer",
      format: "uint64",
      minimum: 1,
      maximum: 10,
      examples: [4],
    })
  })

  test("float", () => {
    const schema = float({
      minimum: 1.25,
      maximum: 9.5,
      examples: [4.75],
    })

    expect(validateSchema(schema)).toEqual({
      type: "number",
      format: "float",
      minimum: 1.25,
      maximum: 9.5,
      examples: [4.75],
    })
  })

  test("double", () => {
    const schema = double({
      minimum: 1.25,
      maximum: 9.5,
      examples: [4.75],
    })

    expect(validateSchema(schema)).toEqual({
      type: "number",
      format: "double",
      minimum: 1.25,
      maximum: 9.5,
      examples: [4.75],
    })
  })

  test("number", () => {
    const schema = number({
      minimum: 1.25,
      maximum: 9.5,
      examples: [4.75],
    })

    expect(validateSchema(schema)).toEqual({
      type: "number",
      minimum: 1.25,
      maximum: 9.5,
      examples: [4.75],
    })
  })

  test("uint32", () => {
    const schema = uint32({
      minimum: 1,
      maximum: 10,
      examples: [4],
    })

    expect(validateSchema(schema)).toEqual({
      type: "integer",
      format: "uint32",
      minimum: 1,
      maximum: 10,
      examples: [4],
    })
  })

  test("httpURL", () => {
    const schema = httpURL()

    expect(validateSchema(schema)).toEqual({
      type: "string",
      format: "uri",
      pattern: "^https?://\\S+$",
    })
  })

  test("unixMillis", () => {
    const schema = unixMillis()

    expect(validateSchema(schema)).toEqual({
      type: "integer",
      format: "int64",
      description: "UNIX epoch milliseconds",
    })
  })

  test("string", () => {
    const schema = string({
      format: "byte",
      minLength: 1,
      maxLength: 8,
      pattern: "^[a-z]+$",
      enum: ["alpha", "beta"],
      examples: ["alpha"],
    })

    expect(validateSchema(schema)).toEqual({
      type: "string",
      format: "byte",
      minLength: 1,
      maxLength: 8,
      pattern: "^[a-z]+$",
      enum: ["alpha", "beta"],
      examples: ["alpha"],
    })
  })

  test("string stringifies RegExp pattern", () => {
    const schema = string({
      minLength: 1,
      pattern: /^[a-z]+$/i,
      examples: ["alpha"],
    })

    expect(validateSchema(schema)).toEqual({
      type: "string",
      minLength: 1,
      pattern: "^[a-z]+$",
      examples: ["alpha"],
    })
  })

  test("string with contentMediaType", () => {
    const schema = string({
      description: "OpenAPI/Swagger file. We accept JSON or YAML.",
      contentMediaType: "application/octet-stream",
    })

    expect(validateSchema(schema)).toEqual({
      type: "string",
      description: "OpenAPI/Swagger file. We accept JSON or YAML.",
      contentMediaType: "application/octet-stream",
    })
  })

  test("string with vendor extensions", () => {
    const schema = string({
      description: "Тип события webhook для пользователей",
      enum: ["invite", "confirm", "update", "suspend", "activate", "delete"],
      "x-enum-descriptions": {
        invite: "Приглашение",
        confirm: "Подтверждение",
        update: "Обновление",
        suspend: "Приостановка",
        activate: "Активация",
        delete: "Удаление",
      },
    })

    expect(validateSchema(schema)).toEqual({
      type: "string",
      description: "Тип события webhook для пользователей",
      enum: ["invite", "confirm", "update", "suspend", "activate", "delete"],
      "x-enum-descriptions": {
        invite: "Приглашение",
        confirm: "Подтверждение",
        update: "Обновление",
        suspend: "Приостановка",
        activate: "Активация",
        delete: "Удаление",
      },
    })
  })

  test("oneOf", () => {
    const schema = oneOf([string(), int32()])

    expect(validateSchema(schema)).toEqual({
      oneOf: [
        {
          type: "string",
        },
        {
          type: "integer",
          format: "int32",
        },
      ],
    })
  })

  test("anyOf", () => {
    const schema = anyOf([string(), int32()])

    expect(validateSchema(schema)).toEqual({
      anyOf: [
        {
          type: "string",
        },
        {
          type: "integer",
          format: "int32",
        },
      ],
    })
  })

  test("allOf", () => {
    const schema = allOf([
      object({
        name: string(),
      }),
      object({
        "nickname?": string(),
      }),
    ])

    expect(validateSchema(schema)).toEqual({
      allOf: [
        {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
          required: ["name"],
        },
        {
          type: "object",
          properties: {
            nickname: {
              type: "string",
            },
          },
        },
      ],
    })
  })

  test("nullable", () => {
    const schema = nullable(int32({ examples: [7] }))

    expect(validateSchema(schema)).toEqual({
      type: ["integer", "null"],
      format: "int32",
      examples: [7],
    })
  })

  test("nullable oneOf", () => {
    const schema = nullable(oneOf([string(), int32()]))

    expect(validateSchema(schema)).toEqual({
      anyOf: [
        {
          oneOf: [
            {
              type: "string",
            },
            {
              type: "integer",
              format: "int32",
            },
          ],
        },
        {
          type: "null",
        },
      ],
    })
  })

  test("nullable unknown", () => {
    const schema = nullable(unknown())

    expect(validateSchema(schema)).toEqual({})
  })

  test("nullable anyOf", () => {
    const schema = nullable(anyOf([string(), int32()]))

    expect(validateSchema(schema)).toEqual({
      anyOf: [
        {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "integer",
              format: "int32",
            },
          ],
        },
        {
          type: "null",
        },
      ],
    })
  })

  test("boolean", () => {
    const schema = boolean({
      description: "Whether the feature is enabled",
      deprecated: true,
      default: false,
    })

    expect(validateSchema(schema)).toEqual({
      type: "boolean",
      description: "Whether the feature is enabled",
      deprecated: true,
      default: false,
    })
  })

  test("unknown", () => {
    const schema = unknown()

    expect(validateSchema(schema)).toEqual({})
  })

  test("email", () => {
    const schema = email()

    expect(validateSchema(schema)).toEqual({
      type: "string",
      format: "email",
    })
  })

  test("isoDuration", () => {
    const schema = isoDuration()

    expect(validateSchema(schema)).toEqual({
      type: "string",
      format: "duration",
      examples: ["P1W", "P1M", "P1Y"],
    })

    expect(validates(schema, "P1D")).toEqual(true)
    expect(validates(schema, "Pfoo")).toEqual(false)
  })

  test("isoDuration with opts", () => {
    const schema = isoDuration({
      description: "How long the token remains valid",
      maxLength: 32,
      examples: ["PT1H"],
    })

    expect(validateSchema(schema)).toEqual({
      type: "string",
      format: "duration",
      examples: ["PT1H"],
      description: "How long the token remains valid",
      maxLength: 32,
    })
  })
})
