import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

import {
  Bodied,
  Bodiless,
  PrimitiveBag,
  isOptional,
  isScope,
  mergeOpts,
  optionalGet,
  RefsRec,
  RObject,
  PathWithMethods,
  SchemaOrRef,
  Scope,
  ScopeOpts,
  Endpoints,
} from "../core/endpoint"
import { requestBody, requestHeaders } from "../core/request"
import { Service } from "../dsl/endpoint"

const obj = <Refs extends RefsRec>(
  schema: RObject<Refs>,
  refs: Refs,
): OpenAPIV3.SchemaObject => ({
  type: "object",
  properties: Object.fromEntries(
    Object.entries(schema.fields).map(([name, s]) => [
      name,
      toSchema(refs, optionalGet(s)),
    ]),
  ),
  required: Object.entries(schema.fields).flatMap(([k, v]) =>
    isOptional(v) ? [] : [k],
  ),
})

const toSchema = <Refs extends RefsRec>(
  refs: Refs,
  schema: SchemaOrRef<Refs, unknown>,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  if (typeof schema === "object" && "type" in schema) {
    switch (schema.type) {
      case "object":
        return obj(schema, refs)

      case "external":
        return { nullable: true }

      default:
        throw new Error(schema.type)
    }
  } else {
    return { $ref: `#/components/schemas/${String(schema)}` }
  }
}

const keyToOpenSchema = <Refs extends RefsRec>(
  refs: Refs,
  name: keyof Refs,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  const schema = refs[name]
  return toSchema(refs, schema)
}

const refsToOpenAPI = <Refs extends RefsRec>(
  refs: Refs,
): Record<string, OpenAPIV3.SchemaObject> =>
  Object.fromEntries(Object.keys(refs).map(k => [k, keyToOpenSchema(refs, k)]))

const rBodyObj = <Refs extends RefsRec>(
  refs: Refs,
  s: ScopeOpts<Refs>,
  x: Bodiless<Refs> | Bodied<Refs>,
): OpenAPIV3.RequestBodyObject | undefined => {
  const reqBodyMime = s.req?.body

  const rBody = requestBody(x)
  if (rBody && !reqBodyMime) {
    throw new Error("there's body but no mime")
  }

  return rBody && reqBodyMime
    ? {
        content: {
          [reqBodyMime]: {
            schema: toSchema(refs, rBody),
          },
        },
      }
    : undefined
}

const toParams = <Refs extends RefsRec>(
  refs: Refs,
  where: "header" | "query" | "path" | "cookie",
  what: PrimitiveBag<Refs> | undefined,
): Array<OpenAPIV3_1.ParameterObject> =>
  Object.entries(what ?? {}).map(([k, v]) => ({
    in: where,
    name: k,
    required: !isOptional(v),
    schema: toSchema(refs, optionalGet(v)),
  }))

const toResponses = <Refs extends RefsRec>(
  scope: ScopeOpts<Refs>,
): OpenAPIV3_1.ResponsesObject => {
  const ret: OpenAPIV3_1.ResponsesObject = {}
  return ret
}

const pathItem = <Refs extends RefsRec>(
  refs: Refs,
  scope: ScopeOpts<Refs>,
  e: PathWithMethods<Refs>,
): OpenAPIV3_1.PathItemObject => {
  console.log(e)

  const { params, ...methods } = e

  const ret: OpenAPIV3_1.PathItemObject = {}

  type RMethod = keyof typeof methods

  const rec: Partial<Record<RMethod, Bodied<Refs> | Bodiless<Refs>>> = methods

  for (const k in rec) {
    const req = rec[k as RMethod]
    if (!req) break

    const method = k.toLowerCase() as OpenAPIV3_1.HttpMethods
    ret[method] = {
      operationId: req.name,
      parameters: toParams(refs, "header", {
        ...scope.req?.headers,
        ...requestHeaders(req),
      })
        .concat(toParams(refs, "query", req.query))
        .concat(toParams(refs, "path", params)),
      requestBody: rBodyObj(refs, scope, req),
      responses: {},
    }
  }
  return ret
}

export const traverse = <Refs extends RefsRec>(
  init: Scope<Refs>,
): ReadonlyArray<
  [opts: ScopeOpts<Refs>, path: `/${string}`, e: PathWithMethods<Refs>]
> => {
  const ret =
    Array<
      [opts: ScopeOpts<Refs>, path: `/${string}`, e: PathWithMethods<Refs>]
    >()

  const stack: Array<[`/${string}`, Scope<Refs>]> = [["" as `/${string}`, init]]

  while (stack.length) {
    const item = stack.pop()
    if (!item) break

    const [path, s] = item
    for (const k in s.endpoints) {
      const mergedPath = `${path}${k}` as const

      const e = s.endpoints[k as keyof Endpoints<{}>]
      if (isScope(e)) {
        stack.push([
          mergedPath,
          { endpoints: e.endpoints, opts: mergeOpts(s.opts, e.opts) },
        ])
      } else {
        ret.push([s.opts ?? {}, mergedPath, e])
      }
    }
  }

  return ret
}

export const toPaths = <Refs extends RefsRec>(
  refs: Refs,
  init: Scope<Refs>,
): [string, OpenAPIV3_1.PathItemObject][] =>
  traverse(init).map(([opts, path, e]) => [path, pathItem(refs, opts, e)])

const paths = <Refs extends RefsRec>(s: Scope<Refs>): OpenAPIV3_1.PathsObject =>
  Object.fromEntries(toPaths(s))

export const toOpenAPI = <Refs extends RefsRec>({
  info,
  refs,
  scope,
}: Service<Refs>): OpenAPIV3_1.Document => ({
  openapi: "3.1.0",
  info: info,
  components: { schemas: refsToOpenAPI(refs) },
  paths: {},
})
