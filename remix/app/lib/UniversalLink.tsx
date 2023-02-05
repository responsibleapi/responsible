import type { ForwardedRef, HTMLProps } from "react"
import React from "react"
import { Link } from "@remix-run/react"

const UniversalLinkX = (
  props: HTMLProps<HTMLAnchorElement>,
  ref: ForwardedRef<HTMLAnchorElement>,
): JSX.Element =>
  props.href?.startsWith("/") ? (
    <Link {...props} ref={ref} to={props.href} />
  ) : (
    <a {...props} ref={ref} target="_blank" rel="noreferrer" />
  )

export const UniversalLink = React.forwardRef(UniversalLinkX)
