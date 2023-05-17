import { Hero } from "./main/jsx/Hero"
import { Strings } from "./main/strings"
import stylesheet from "./tailwind.css"
import type {
  LinksFunction,
  LoaderArgs,
  TypedResponse,
  V2_MetaFunction,
} from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { cssBundleHref } from "@remix-run/css-bundle"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import React, { type JSX } from "react"

const hostURL = (host: string, path?: string): string => {
  const proto =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https"

  return `${proto}://${host}${path ?? ""}`
}

export const loader = ({
  request,
}: LoaderArgs): TypedResponse<{ host: string }> =>
  json({
    host: request.headers.get("host") || "localhost:3000",
  })

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { name: "og:image", content: hostURL(data.host, "/OG.jpg") },
]

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: stylesheet },
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2337d0ee' d='M21 8.8V19a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h8.2a3 3 0 0 1 2 .9l4 3.8a3 3 0 0 1 .8 2.1Z'/%3E%3Cpath fill='%232fb1cb' d='M21 8.8V10h-4a3 3 0 0 1-3-3V2h.2a3 3 0 0 1 2 .9l4 3.8a3 3 0 0 1 .8 2.1Z'/%3E%3Cpath fill='%23fff' d='M11.3 17a1 1 0 0 1-.8-.3L9 15.2a1 1 0 0 1 1.5-1.4l.8.8 2.2-2.3a1 1 0 0 1 1.5 1.4l-3 3a1 1 0 0 1-.8.3Z'/%3E%3C/svg%3E",
  },
]

export default function App(): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{Strings.title}</title>
        <meta name="description" content={Strings.description} />
        <Meta />
        <Links />
      </head>

      <body>
        <Hero>
          <Outlet />
        </Hero>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
