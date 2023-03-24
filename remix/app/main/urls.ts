export const EXTERNAL_URLS = {
  discord: "https://discord.gg/hDtq7C5uua",
  docs: "https://github.com/responsibleapi/responsible#readme",
} as const

export const INTERNAL_URLS = {
  editor: "/editor",
} as const

export const HERO_NAVIGATION: ReadonlyArray<{
  name: string
  href: `https://${string}` | `/${string}`
}> = [
  { name: "Docs", href: EXTERNAL_URLS.docs },
  { name: "Editor", href: INTERNAL_URLS.editor },
  { name: "Discord", href: EXTERNAL_URLS.discord },
]
