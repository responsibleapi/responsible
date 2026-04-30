import type { oas31 } from "openapi3-ts"

export interface ComponentRegistryState {
  components: {
    schemas: oas31.SchemasObject
    parameters: Record<string, oas31.ParameterObject | oas31.ReferenceObject>
    headers: Record<string, oas31.HeaderObject | oas31.ReferenceObject>
    responses: Record<string, oas31.ResponseObject>
    securitySchemes: Record<
      string,
      oas31.SecuritySchemeObject | oas31.ReferenceObject
    >
  }
  inProgress: {
    schemas: Set<string>
    parameters: Set<string>
    headers: Set<string>
    securitySchemes: Set<string>
  }

  /**
   * Generates unique component names for unnamed security schemes so compiler
   * can materialize them in `components.securitySchemes` during single pass.
   */
  anonymousSecuritySeq: number
}

export function createComponentRegistryState(): ComponentRegistryState {
  return {
    components: {
      schemas: {},
      parameters: {},
      headers: {},
      responses: {},
      securitySchemes: {},
    },
    inProgress: {
      schemas: new Set(),
      parameters: new Set(),
      headers: new Set(),
      securitySchemes: new Set(),
    },
    anonymousSecuritySeq: 0,
  }
}
