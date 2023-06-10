import { type kdljs } from "kdljs"
import { type OpenAPIV3 } from "openapi-types"
import { getString } from "./kdl"
import { isRequired } from "./schema"
import { capitalize } from "./typescript"

const parseSecurities = (
  parent: kdljs.Node,
): ReadonlyArray<OpenAPIV3.ApiKeySecurityScheme> => {
  const ret = Array<OpenAPIV3.ApiKeySecurityScheme>()

  for (const node of parent.children) {
    switch (node.name) {
      case "cookie":
      case "header":
      case "query": {
        ret.push({ type: "apiKey", name: getString(node, 0), in: node.name })
        break
      }

      default: {
        throw new Error(`unknown security type ${node.name}`)
      }
    }
  }

  return ret
}

const toRecord = (
  arr: ReadonlyArray<OpenAPIV3.ApiKeySecurityScheme>,
): Record<string, OpenAPIV3.ApiKeySecurityScheme> =>
  Object.fromEntries(
    arr.map(x => [`${capitalize(x.name)}${capitalize(x.in)}`, x]),
  )

export interface ParsedSecurity {
  securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject>
  security: OpenAPIV3.SecurityRequirementObject[]
}

const addOptional = (
  node: kdljs.Node,
  security: Array<OpenAPIV3.SecurityRequirementObject>,
): Array<OpenAPIV3.SecurityRequirementObject> => {
  if (!isRequired(node)) {
    security.push({})
  }
  return security
}

export const parseSecurity = (parent: kdljs.Node): ParsedSecurity => {
  const node = parent.children[0]
  if (!node) return { securitySchemes: {}, security: [] }

  switch (node.name) {
    case "OR": {
      const securitySchemes = toRecord(parseSecurities(node))
      return {
        securitySchemes,
        security: addOptional(
          parent,
          Object.keys(securitySchemes).map(x => ({ [x]: [] })),
        ),
      }
    }

    case "AND": {
      const securitySchemes = toRecord(parseSecurities(node))
      return {
        securitySchemes,
        security: addOptional(parent, [
          Object.fromEntries(Object.keys(securitySchemes).map(x => [x, []])),
        ]),
      }
    }

    default: {
      const securitySchemes = toRecord(parseSecurities(parent))
      const securityKeys = Object.keys(securitySchemes)
      if (securityKeys.length !== 1) {
        throw new Error(`security must be OR or AND or single`)
      }

      return {
        securitySchemes,
        security: addOptional(parent, [{ [securityKeys[0]]: [] }]),
      }
    }
  }
}
