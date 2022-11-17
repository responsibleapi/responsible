import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare"
import styles from "./styles/app.css"

// noinspection JSUnusedGlobalSymbols
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
})

// noinspection JSUnusedGlobalSymbols
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }]

// noinspection JSUnusedGlobalSymbols
export default function App(): JSX.Element {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
