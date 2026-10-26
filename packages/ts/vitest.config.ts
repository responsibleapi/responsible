import { defineConfig } from "vitest/config"
import { parse } from "yaml"

// Bun's YAML import attribute is also supported by the Node/Vitest test run.
export default defineConfig({
  plugins: [
    {
      name: "responsible-yaml",
      enforce: "pre",
      transform(source, id) {
        if (id.endsWith(".yaml"))
          return {
            code: `export default ${JSON.stringify(parse(source))}`,
            map: null,
          }
        return undefined
      },
    },
  ],
})
