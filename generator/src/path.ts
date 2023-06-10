export type URLPath = `/${string}`

export const isURLPath = (s: string): s is URLPath =>
  s.startsWith("/") && !s.includes(" ")

const parseSegment = (
  input: string,
): [segment: string, types: Record<string, string>] => {
  const types: Record<string, string> = {}

  let segment = ""

  let name: string | undefined
  let type: string | undefined

  for (const char of input) {
    let addName = true
    let addType = true
    let addSegment = true

    switch (char) {
      case ":": {
        if (name) {
          types[name] = "string"
          segment += `{${name}}`
          addSegment = false
        }
        name = ""
        type = undefined
        addName = false
        break
      }

      case "(": {
        type = ""
        addType = false
        break
      }

      case ")": {
        if (!name || !type) {
          throw new Error(JSON.stringify({ segment, char, name, type }))
        }

        types[name] = type
        segment += `{${name}}`
        addSegment = false

        name = undefined
        type = undefined
        break
      }

      case ".":
      case "/": {
        if (name) {
          types[name] = "string"
          segment += `{${name}}`
        }
        name = undefined
        type = undefined
        break
      }
    }

    if (name !== undefined && addName && type === undefined) {
      name += char
    }
    if (addType && type !== undefined) {
      type += char
    }
    if (addSegment && name === undefined && type === undefined) {
      segment += char
    }
  }

  return [segment, types]
}

/**
 * TODO use String.indexOf in a loop
 */
// const parseSegment2 = (
//   s: string,
// ): [segment: string, types: Record<string, string>] => {
// }

export interface TypedPath {
  path: URLPath | ""
  types: Record<string, string>
}

export const parsePath = (input: URLPath | ""): TypedPath => {
  const [path, types] = parseSegment(input)
  return { path: path as URLPath | "", types }
}

export const mergePaths = (...arr: ReadonlyArray<TypedPath>): TypedPath => {
  const types: Record<string, string> = {}
  let path: URLPath | "" = ""

  for (const tp of arr) {
    path = `${path}${tp.path}`
    Object.assign(types, tp.types)
  }

  return { path, types }
}
