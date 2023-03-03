import React from "react"
import { Outlet } from "@remix-run/react"

import { Hero } from "../main/Hero"

export default function Layout(): JSX.Element {
  return (
    <Hero>
      <Outlet />
    </Hero>
  )
}
