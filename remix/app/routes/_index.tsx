import React from "react"
import CodeMirror from "@uiw/react-codemirror"

import { UniversalLink } from "../lib/UniversalLink"
import { NAV_URLS } from "../main/jsx/Hero"
import { exampleKDL } from "../main/examplekdl"

// noinspection JSUnusedGlobalSymbols
export default function Index(): JSX.Element {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Build reliable HTTP APIs
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-300">
          Responsible API is an OpenAPI toolkit that features a concise language
          and testing libraries, empowering you to build robust HTTP APIs in any
          language or framework
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <UniversalLink
            href={NAV_URLS.editor}
            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Get started
          </UniversalLink>

          <UniversalLink
            href={NAV_URLS.docs}
            className="text-sm font-semibold leading-6 text-white"
          >
            Learn more <span aria-hidden="true">→</span>
          </UniversalLink>
        </div>
      </div>

      <CodeMirror
        className="mt-16 overflow-hidden rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 sm:mt-24"
        value={exampleKDL}
        theme="dark"
        readOnly
      />
    </div>
  )
}
