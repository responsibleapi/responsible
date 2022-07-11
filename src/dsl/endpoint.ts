import { PrimitiveOptionality, PrimitiveSchema, TheType } from "./schema"

type LCMethod =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options"
  | "trace"

type Method = LCMethod | Uppercase<LCMethod>

interface Bodied {
  req: TheType
  res: Record<number, TheType>
  params: Record<string, PrimitiveSchema>
  query: Record<string, PrimitiveSchema | PrimitiveOptionality>
}

type Endpoints = Record<`/${string}`, Record<Method, any>>
