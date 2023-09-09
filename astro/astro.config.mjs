import solidJs from "@astrojs/solid-js"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"

// https://astro.build/config
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  integrations: [tailwind(), solidJs()],
  /** https://vitejs.dev/config/ */
  vite: {
    server: {
      watch: {
        ignored: ["**/.idea/**", "**/.DS_Store"],
      },
    },
  },
})
