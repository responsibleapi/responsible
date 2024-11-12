import typography from "@tailwindcss/typography"
import { type Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{astro,html,jsx,md,mdx,svelte,tsx,vue}", "index.html"],
  theme: {
    extend: {},
  },
  plugins: [typography],
} satisfies Config
