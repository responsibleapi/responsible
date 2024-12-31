import * as fs from "fs/promises"
import * as path from "path"

async function main() {
  const dir = process.argv[2]
  console.log("walking", dir)

  const files = await fs.readdir(dir, { recursive: true })
  for (const name of files) {
    if (!name.endsWith(".js")) continue

    const filePath = path.join(dir, name)
    const s = await fs.readFile(filePath, "utf8")
    await fs.writeFile(
      filePath,
      s.replace(/from "(\..*)"/g, (_, p1) => `from "${p1}.js"`),
    )
  }
}

void main()
