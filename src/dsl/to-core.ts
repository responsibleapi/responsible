
import { CoreService, RefsRec } from "../core/core"
import { DslService } from "./endpoint"

export const toCore = <Refs extends RefsRec>(
  s: DslService<Refs>,
): CoreService<Refs> => {
  return {
    info: s.info,
    refs: s.refs,
    paths: {},
  }
}
