# AGENTS.md

## Monorepo

- Root package manager: Bun workspaces over `packages/*`.
- Shell: `fish`.
- Maintained packages in the shared root validation flow:
  - `packages/ts` as `@responsibleapi/ts`.
  - `packages/hono` as `@responsibleapi/hono`.
- Legacy KDL packages remain in the repo, but root `task check`
  should not depend on them.

## TypeScript

- Run package tasks through Taskfile from the root when possible.
- Verify maintained TypeScript package changes with the relevant package task:
  - `task ts:check` for `packages/ts`.
  - `task hono:check` for `packages/hono`.
- Do not disable or skip tests.

## Release

- Verify npm auth with `task publish:auth`.
- Release only from a clean `master` worktree.
- Use package-specific release tasks:
  - `task release:ts` for `@responsibleapi/ts`.
  - `task release:hono` for `@responsibleapi/hono`.
- Publish public packages with `bun publish --access public`.
- Use package-scoped annotated tags, such as `ts-v<maj>.<min>.<ptch>` and `hono-v<maj>.<min>.<ptch>`.
