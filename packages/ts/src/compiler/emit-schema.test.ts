import { describe, expect, test } from "vitest"
import { named } from "../dsl/nameable.ts"
import {
  allOf,
  array,
  dict,
  int32,
  nullable,
  object,
  oneOf,
  string,
  type Schema,
} from "../dsl/schema.ts"
import { validateSchema } from "../help/validate-schema.ts"
import { createComponentRegistryState } from "./components.ts"
import { emitSchemaRefOrValue } from "./emit-schema.ts"

describe("emitSchemaRefOrValue", () => {
  test("emits object and dictionary helper fields", () => {
    expect(
      validateSchema(
        emitSchemaRefOrValue(
          createComponentRegistryState(),
          object(
            {
              title: string({ pattern: /^[a-z]+$/i }),
              "scores?": dict(string({ minLength: 1 }), int32({ minimum: 0 })),
            },
            {
              description: "Article metadata",
              deprecated: true,
            },
          ),
        ),
      ),
    ).toEqual({
      description: "Article metadata",
      deprecated: true,
      type: "object",
      properties: {
        title: {
          type: "string",
          pattern: "^[a-z]+$",
        },
        scores: {
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
        },
      },
      required: ["title"],
    })
  })

  test("omits default string dictionary property names", () => {
    expect(
      validateSchema(
        emitSchemaRefOrValue(
          createComponentRegistryState(),
          dict(string(), int32({ minimum: 0 })),
        ),
      ),
    ).toEqual({
      type: "object",
      additionalProperties: {
        type: "integer",
        format: "int32",
        minimum: 0,
      },
    })
  })

  test("emits string content schemas and vendor extensions", () => {
    expect(
      validateSchema(
        emitSchemaRefOrValue(
          createComponentRegistryState(),
          string({
            contentMediaType: "application/json",
            contentSchema: object({
              type: string(),
            }),
            enum: ["invite", "confirm"],
            "x-enum-descriptions": {
              invite: "Invitation",
              confirm: "Confirmation",
            },
          }),
        ),
      ),
    ).toEqual({
      type: "string",
      contentMediaType: "application/json",
      contentSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
          },
        },
        required: ["type"],
      },
      enum: ["invite", "confirm"],
      "x-enum-descriptions": {
        invite: "Invitation",
        confirm: "Confirmation",
      },
    })
  })

  test("compiles nested array examples with named item schema", () => {
    const Button = () =>
      object({
        text: string(),
        "url?": string({ format: "uri" }),
      })

    const examples = [
      [
        [
          {
            text: "Подробнее",
            url: "https://example.com/details",
          },
        ],
      ],
    ] as const

    const description =
      "Массив строк, каждая из которых представлена массивом кнопок. Максимум 100 кнопок у сообщения, до 8 кнопок в строке. Для удаления кнопок пришлите пустой массив."

    const dsl = array(array(Button), {
      description,
      examples,
    })

    expect(
      validateSchema(emitSchemaRefOrValue(createComponentRegistryState(), dsl)),
    ).toEqual({
      type: "array",
      items: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Button",
        },
      },
      description,
      examples,
    })
  })

  test("compiles nullable nested array examples with named item schema", () => {
    const Button = () =>
      object({
        text: string(),
        "url?": string({ format: "uri" }),
      })

    const examples = [
      [
        [
          {
            text: "Подробнее",
            url: "https://example.com/details",
          },
        ],
      ],
      null,
    ] as const

    const description =
      "Массив строк, каждая из которых представлена массивом кнопок. Максимум 100 кнопок у сообщения, до 8 кнопок в строке. Для удаления кнопок пришлите пустой массив."

    const dsl = {
      ...nullable(
        array(array(Button), {
          description,
        }),
      ),
      examples,
    } as Schema

    expect(
      validateSchema(emitSchemaRefOrValue(createComponentRegistryState(), dsl)),
    ).toEqual({
      type: ["array", "null"],
      items: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Button",
        },
      },
      description,
      examples,
    })
  })

  test("collapses nullable allOf into typed nullable schema", () => {
    const Forwarding = named(
      "Forwarding",
      object({
        id: string(),
      }),
    )

    expect(
      validateSchema(
        emitSchemaRefOrValue(
          createComponentRegistryState(),
          nullable(
            allOf([Forwarding], {
              description: "Forwarding info",
            }),
          ),
        ),
      ),
    ).toEqual({
      description: "Forwarding info",
      type: ["object", "null"],
      allOf: [{ $ref: "#/components/schemas/Forwarding" }],
    })
  })

  test("emits oneOf discriminator mapping for named variants", () => {
    const StdoutMailerConfig = named(
      "StdoutMailerConfig",
      object({
        mode: string({ const: "stdout" }),
      }),
    )
    const TestMailerConfig = named(
      "TestMailerConfig",
      object({
        mode: string({ const: "test" }),
      }),
    )
    const SesMailerConfig = named(
      "SesMailerConfig",
      object({
        mode: string({ const: "ses" }),
      }),
    )

    expect(
      validateSchema(
        emitSchemaRefOrValue(
          createComponentRegistryState(),
          oneOf([StdoutMailerConfig, TestMailerConfig, SesMailerConfig], {
            discriminator: {
              propertyName: "mode",
              mapping: {
                stdout: StdoutMailerConfig,
                test: TestMailerConfig,
                ses: SesMailerConfig,
              },
            },
          }),
        ),
      ),
    ).toEqual({
      discriminator: {
        propertyName: "mode",
        mapping: {
          stdout: "#/components/schemas/StdoutMailerConfig",
          test: "#/components/schemas/TestMailerConfig",
          ses: "#/components/schemas/SesMailerConfig",
        },
      },
      oneOf: [
        { $ref: "#/components/schemas/StdoutMailerConfig" },
        { $ref: "#/components/schemas/TestMailerConfig" },
        { $ref: "#/components/schemas/SesMailerConfig" },
      ],
    })
  })

  test("synthesizes null example for nullable leaf schema without examples", () => {
    expect(
      validateSchema(
        emitSchemaRefOrValue(createComponentRegistryState(), {
          type: ["integer", "null"],
          format: "int32",
        }),
      ),
    ).toEqual({
      type: ["integer", "null"],
      format: "int32",
      examples: [null],
    })
  })

  test("does not synthesize null example for nullable object with properties", () => {
    expect(
      validateSchema(
        emitSchemaRefOrValue(createComponentRegistryState(), {
          type: ["object", "null"],
          properties: {
            id: string(),
          },
          required: ["id"],
        }),
      ),
    ).toEqual({
      type: ["object", "null"],
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    })
  })
})
