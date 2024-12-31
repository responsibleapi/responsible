import * as fs from "fs/promises"
import * as path from "path"

async function walk(dir: string) {
  const names = await fs.readdir(dir, { recursive: true })
  for (const name of names) {
    if (!name.endsWith(".js")) continue

    const absPath = path.join(dir, name)
    const s = await fs.readFile(absPath, "utf-8")
    await fs.writeFile(
      absPath,
      s.replace(/from "(\..+)"/g, (_, p1) => `from "${p1}.js"`),
    )
  }
}

void walk(process.argv.length > 2 ? process.argv[2] : "dist/")
