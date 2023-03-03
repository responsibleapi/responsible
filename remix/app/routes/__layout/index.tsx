import React from "react"
import { UniversalLink } from "../../lib/UniversalLink"
import { NAV_URLS } from "../../main/Hero"

// noinspection JSUnusedGlobalSymbols
export default function Index(): JSX.Element {
  return (
    <div className="my-18 mx-auto max-w-7xl px-6 sm:my-32 lg:mb-40 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Build HTTP APIs with confidence
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          Responsible API is a toolkit for increased OpenAPI productivity
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <UniversalLink
            href={NAV_URLS.editor}
            className="rounded-md bg-indigo-600 px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get started
          </UniversalLink>

          <UniversalLink
            href={NAV_URLS.docs}
            className="text-base font-semibold leading-7 text-gray-900"
          >
            Learn more <span aria-hidden="true">→</span>
          </UniversalLink>
        </div>
      </div>

      <div className="mt-16 flow-root sm:mt-24">
        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
          <div
            style={{
              position: "relative",
              paddingBottom: "62.5%",
              height: 0,
            }}
            dangerouslySetInnerHTML={{
              __html:
                '<iframe src="https://www.loom.com/embed/c2bd1e534cd24e70a36bc1a01b5a354c" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>',
            }}
          />
        </div>
      </div>
    </div>
  )
}
