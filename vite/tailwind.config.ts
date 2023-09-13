import typo from "@tailwindcss/typography"
import { type Config } from "tailwindcss"

const cfg: Config = {
  content: ["./src/**/*.{astro,html,jsx,md,mdx,svelte,tsx,vue}", "index.html"],
  theme: {
    extend: {},
  },
  plugins: [typo],
}

// noinspection JSUnusedGlobalSymbols
export default cfg
