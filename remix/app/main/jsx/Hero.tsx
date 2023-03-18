interface Nav {
  name: string
  href: `https://${string}` | `/${string}`
}

export const NAV_URLS = {
  docs: "https://github.com/responsibleapi/responsible#readme",
  editor: "/editor",
} as const

export const HERO_NAVIGATION: ReadonlyArray<Nav> = [
  { name: "Docs", href: NAV_URLS.docs },
  { name: "Editor", href: NAV_URLS.editor },
  { name: "Discord", href: "https://discord.gg/wuhd9QzQ33" },
]
