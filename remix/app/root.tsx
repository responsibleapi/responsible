import stylesheet from "./tailwind.css"

import React from "react"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare"

import { Hero2 } from "./main/jsx/Hero2"

// noinspection JSUnusedGlobalSymbols
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
})

// noinspection JSUnusedGlobalSymbols
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export default function App(): JSX.Element {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body>
        <Hero2>
          <Outlet />
        </Hero2>

        <ScrollRestoration />
        <Scripts />
        {/*<LiveReload />*/}
      </body>
    </html>
  )
}
