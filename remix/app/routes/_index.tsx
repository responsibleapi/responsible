import React from "react"
import type { LinksFunction } from "@remix-run/cloudflare"

import { UniversalLink } from "../lib/UniversalLink"
import { EXTERNAL_URLS, INTERNAL_URLS } from "../main/urls"
import LandingMirror from "../main/jsx/LandingMirror"
import { highlightCSS } from "../main/jsx/HighlightedEditor"

export const links: LinksFunction = () => [highlightCSS]

// noinspection JSUnusedGlobalSymbols
export default function Index(): JSX.Element {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Build reliable HTTP APIs
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-300">
          ResponsibleAPI is a small language that compiles to OpenAPI
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <UniversalLink
            href={INTERNAL_URLS.editor}
            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Get started
          </UniversalLink>

          <UniversalLink
            href={EXTERNAL_URLS.docs}
            className="text-sm font-semibold leading-6 text-white"
          >
            Learn more <span aria-hidden="true">→</span>
          </UniversalLink>
        </div>
      </div>

      <LandingMirror />
    </div>
  )
}
