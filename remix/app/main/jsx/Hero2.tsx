import type { ReactNode } from "react"
import React, { useState } from "react"
import { Dialog } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"

import { RobotSVG } from "./RobotSVG"
import { HERO_NAVIGATION } from "../urls"
import { UniversalLink } from "../../lib/UniversalLink"
import { Strings } from "../strings"

const navigation = HERO_NAVIGATION

const TopGradient = () => (
  <svg
    className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
    viewBox="0 0 1155 678"
  >
    <path
      fill="url(#f4773080-2a16-4ab4-9fd7-579fec69a4f7)"
      fillOpacity=".2"
      d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
    />
    <defs>
      <linearGradient
        id="f4773080-2a16-4ab4-9fd7-579fec69a4f7"
        x1="1155.49"
        x2="-78.208"
        y1=".177"
        y2="474.645"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#9089FC" />
        <stop offset={1} stopColor="#FF80B5" />
      </linearGradient>
    </defs>
  </svg>
)

export const Hero2 = ({ children }: { children: ReactNode }): JSX.Element => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-gray-900">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <UniversalLink href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <RobotSVG className="h-8 w-auto" />
            </UniversalLink>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map(item => (
              <UniversalLink
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-white"
              >
                {item.name}
              </UniversalLink>
            ))}
          </div>

          {/*dummy*/}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end"></div>
        </nav>

        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
              <UniversalLink href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">{Strings.title}</span>
                <RobotSVG className="h-8 w-auto" />
              </UniversalLink>

              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/25">
                <div className="space-y-2 py-6">
                  {navigation.map(item => (
                    <UniversalLink
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                    >
                      {item.name}
                    </UniversalLink>
                  ))}
                </div>

                {/*dummy*/}
                <div className="py-6"></div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <TopGradient />
        </div>

        <div className="py-24 sm:py-32 lg:pb-40">{children}</div>
      </div>
    </div>
  )
}
