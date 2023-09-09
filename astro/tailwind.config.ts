import typo from "@tailwindcss/typography"
import { type Config } from "tailwindcss"

const cfg: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [typo],
}

// noinspection JSUnusedGlobalSymbols
export default cfg
