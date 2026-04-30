#!/usr/bin/env bun
import Bun from "bun"

async function main([inputPath, outputPath]: readonly string[]) {
  if (!inputPath || !outputPath) {
    console.error(
      "Usage: bun scripts/yaml-2-json.ts <input.yaml> <output.json>",
    )
    return
  }

  const input = await Bun.file(inputPath).text()
  const output = `${JSON.stringify(Bun.YAML.parse(input), null, 2)}\n`

  await Bun.file(outputPath).write(output)
}

if (import.meta.main) {
  await main(Bun.argv.slice(2))
}
