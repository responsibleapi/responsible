import {
  isKey,
  isOptional,
  isSchema,
  Optional,
  RSchema,
  RStruct,
  RuntimeType,
  SchemaOrRef,
} from "../core/schema"
import { CoreService, CoreTypeRefs } from "../core/core"

const DATACLASS = "dataclasses.dataclass"

const TYPING_OPTIONAL = "typing.Optional"
const TYPING_ANY = "typing.Any"
const TYPING_TYPE_VAR = "typing.TypeVar"
const TYPING_GENERIC = "typing.Generic"
const TYPING_NEW_TYPE = "typing.NewType"
const TYPING_LIST = "typing.List"

const RESPONSIBLE_HTTP_URL = "responsible.types.HttpURL"
const RESPONSIBLE_MIME = "responsible.types.Mime"
const RESPONSIBLE_EMAIL = "responsible.types.Email"

type Indentation = Array<"\t">

const indented = <T>(i: Indentation, f: (indent: string) => T): T => {
  i.push("\t")
  const ret = f(i.join(""))
  i.pop()
  return ret
}

type Import = `${string}.${string}`

const imported = (imports: Set<Import>, i: Import): string => {
  imports.add(i)
  return i
}

const importsStr = (is: Set<Import>): string =>
  [
    ...new Set(
      [...is].map(i => `import ${i.substring(0, i.lastIndexOf("."))}`),
    ),
  ].join("\n")

const runtimes: Record<RuntimeType, Import> = {
  httpURL: RESPONSIBLE_HTTP_URL,
  mime: RESPONSIBLE_MIME,
  email: RESPONSIBLE_EMAIL,
}

const schemaTypeName = (imports: Set<Import>, x: RSchema): string => {
  switch (x.type) {
    case "array":
      return `${imported(imports, TYPING_LIST)}[${typeName(imports, x.items)}]`

    case "runtime-library":
      return imported(imports, runtimes[x.name])

    case "string":
      return "str"

    case "object":
      throw new Error(JSON.stringify(x))

    case "unknown":
      return imported(imports, TYPING_ANY)

    default:
      throw new Error(x.type)
  }
}

/**
 * TODO consider generics
 */
const typeName = (imports: Set<Import>, x: SchemaOrRef | Optional): string => {
  if (isOptional(x)) {
    const opt = imported(imports, TYPING_OPTIONAL)
    return `${opt}[${typeName(imports, x.schema)}]`
  }

  if (isSchema(x)) {
    return schemaTypeName(imports, x)
  }

  return String(x)
}

const declareDataclass = (
  refs: CoreTypeRefs,
  refName: string,
  imports: Set<Import>,
): string => {
  const o = refs[refName] as RStruct

  const genericNames = Object.values(o.fields).flatMap(field =>
    isKey(refs, field) && refs[field].type === "external" ? [field] : [],
  )

  const gen = imported(imports, TYPING_GENERIC)
  const generics = genericNames.length
    ? (`${gen}[${genericNames.join(", ")}]` as const)
    : ""

  const fields = indented([], indent =>
    Object.entries(o.fields)
      .map(
        ([fieldName, schema]) =>
          `${indent}${fieldName}: ${typeName(imports, schema)}` as const,
      )
      .join("\n"),
  )

  const cName = String(refName)
  const dataclass = imported(imports, DATACLASS)
  return `@${dataclass}\nclass ${cName}(${generics}):\n${fields}\n`
}

const declareType = (
  refs: CoreTypeRefs,
  name: string,
  imports: Set<Import>,
): string => {
  const x = refs[name]
  switch (x.type) {
    case "string":
    case "runtime-library":
      return ""

    case "newtype": {
      const NewType = imported(imports, TYPING_NEW_TYPE)
      return `${name} = ${NewType}('${name}', ${typeName(imports, x.schema)})\n`
    }

    case "external": {
      const T = String(name)
      return `${T} = ${imported(imports, TYPING_TYPE_VAR)}('${T}')\n`
    }

    case "object":
      return declareDataclass(refs, name, imports)

    default:
      throw new Error(x.type)
  }
}

export const genPythonTypes = ({ refs }: CoreService): string => {
  const imports = new Set<Import>()

  const declarations = Object.keys(refs)
    .map(k => declareType(refs, k, imports))
    .join("\n")

  return `${importsStr(imports)}\n\n${declarations}` as const
}
