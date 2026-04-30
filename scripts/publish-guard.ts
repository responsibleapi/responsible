#!/usr/bin/env bun
import { $ } from "bun"

async function main() {
  const branch = (await $`git branch --show-current`.text()).trim()

  if (branch !== "master") {
    console.error("publish blocked: branch must be master")
    process.exitCode = 1
    return
  }

  const worktreeStatus = await $`git status --short`.text()

  if (worktreeStatus.trim()) {
    console.error("publish blocked: git worktree must be clean")
    console.error(worktreeStatus.trimEnd())
    process.exitCode = 1
    return
  }
}

if (import.meta.main) {
  await main()
}
