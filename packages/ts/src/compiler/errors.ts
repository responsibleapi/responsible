export const ErrorMsg = {
  /**
   * @compiler
   * @see {@link import("../dsl/operation.ts").OpReq.body}
   */
  operationRequestMime:
    'Operation request mime is not supported. Rewrite `mime: "application/json", body: T` as `body: { "application/json": T }`, or put shared defaults in forEachOp.req.mime.',
} as const
