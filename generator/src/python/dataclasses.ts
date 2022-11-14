import {
  isKey,
  isOptional,
  isSchema,
  Optional,
  RSchema,
  RStruct,
  SchemaOrRef,
} from "../core/RSchema"
import { CoreService, CoreTypeRefs } from "../core/core"

const DATACLASS = "dataclasses.dataclass"
const TYPING_OPTIONAL = "typing.Optional"
const TYPING_ANY = "typing.Any"
const TYPING_TYPEVAR = "typing.TypeVar"
const TYPING_GENERIC = "typing.Generic"

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

const schemaTypeName = (imports: Set<Import>, x: RSchema): string => {
  switch (x.type) {
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
const typeName = (x: SchemaOrRef | Optional, imports: Set<Import>): string => {
  if (isSchema(x)) {
    return schemaTypeName(imports, x)
  }

  if (isOptional(x)) {
    const opt = imported(imports, TYPING_OPTIONAL)
    return `${opt}[${typeName(x.schema, imports)}]`
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
          `${indent}${fieldName}: ${typeName(schema, imports)}` as const,
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
  switch (refs[name].type) {
    case "external": {
      const T = String(name)
      return `${T} = ${imported(imports, TYPING_TYPEVAR)}('${T}')\n`
    }

    case "object":
      return declareDataclass(refs, name, imports)

    default:
      throw new Error("")
  }
}

export const genPythonTypes = ({ refs }: CoreService): string => {
  const imports = new Set<Import>()

  const declarations = Object.keys(refs)
    .map(k => declareType(refs, k, imports))
    .join("\n")

  return `${importsStr(imports)}\n\n${declarations}` as const
}
