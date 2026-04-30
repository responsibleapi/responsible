import type { oas31 } from "openapi3-ts"
import { compileResponsibleAPI } from "../compiler/index.ts"
import type { Resp } from "./operation.ts"
import type { Schema } from "./schema.ts"
import type { ForEachPath, PathRoutes, ScopeOpts } from "./scope.ts"
import type { Security } from "./security.ts"

export type OptionalKey = `${string}?`

/**
 * **DSL**
 *
 * Holds info both about name AND optionality of something used in schemas and
 * req params.
 *
 * **Compiler**
 *
 * Emits `required` based on {@link isOptional}.
 *
 * @dsl
 */
// oxlint-disable-next-line typescript/no-redundant-type-constituents
export type NameWithOptionality = string | OptionalKey

export const isOptional = (k: NameWithOptionality): k is OptionalKey =>
  k.endsWith("?")

/**
 * See other @dsl JSDocs to understand why we omit `#/components/`
 *
 * @dsl
 */
export type PartialDoc = Partial<
  Omit<oas31.OpenAPIObject, "components" | "security">
>

export interface ResponsibleApiInput {
  partialDoc: PartialDoc
  forEachOp?: ScopeOpts
  forEachPath?: ForEachPath
  routes: PathRoutes
  /**
   * Doc level security
   *
   * @dsl
   */
  security?: Security

  /**
   * Compiler drops unused components, but golden examples may still contain
   * unused response components. This is compromise for keeping fixture parity.
   *
   * DO NOT USE.
   *
   * @dsl
   */
  missingResponses?: readonly Resp[]

  /**
   * Compiler drops unused components, but golden examples may still contain
   * unused schemas. This is compromise for keeping fixture parity.
   *
   * DO NOT USE.
   *
   * @dsl
   */
  missingSchemas?: readonly Schema[]
}

export function responsibleAPI(api: ResponsibleApiInput): oas31.OpenAPIObject {
  return compileResponsibleAPI(api)
}
