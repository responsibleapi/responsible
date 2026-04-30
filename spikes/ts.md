# `@responsibleapi/ts` Migration Plan

Source repo: `/Users/adelnizamutdinov/projects/responsibleapi/`

Target package: `packages/ts/`

Goal: move the new TypeScript DSL/compiler package into this monorepo as
`@responsibleapi/ts`, preserve its newer tooling and release process, wire it
into the root Taskfile, publish it from the monorepo, publish the maintained
Hono package through the same release discipline, and finish by deprecating the
legacy KDL npm packages in favor of `@responsibleapi/ts`.

## Working Assumptions

- `packages/ts` becomes the canonical home of the new package.
- The first monorepo-published `@responsibleapi/ts` version should be a new
  version, not a republish of the source repo's current `1.0.7`.
- The old KDL packages (`packages/generator` and `packages/cli`) and the
  website remain in the repo, but they are legacy and should be removed from the
  root check and release flow.
- The new package keeps its own modern toolchain (`oxlint`, `oxfmt`, TypeScript
  6, current Bun/Vitest stack) instead of forcing the whole monorepo off
  eslint/prettier in the same change.
- Do not copy any npm auth token from the source repo. The source `.npmrc`
  contains a concrete token and must stay out of git.

## Current State

- `packages/ts` already exists and is empty.
- The root package is a Bun workspace over `packages/*`.
- The root Taskfile currently includes `generator`, `cli`, `website`, and
  `hono`, but not `ts`.
- Root `publish` currently checks `generator` and publishes `cli`.
- Root `release` currently runs `publish` and `deploy`.
- `Taskfile.common.yaml` still references `../../bun.lockb`, but this repo has
  `bun.lock`.
- The legacy CLI compiles `.kdl` files through `packages/generator/src/kdl`.
- The website imports `packages/generator/src/kdl` directly, so it is still tied
  to the KDL generator until separately migrated.
- The source repo package is `@responsibleapi/ts@1.0.7`, ESM-only, exports
  `./dist/index.js`, emits declarations, requires Node `>=22.18.0`, and uses
  `bun publish --access public`.

## Success Criteria

The migration is successful only when all of the following are true.

- Agentic repo context is installed before code movement:
  - Root `./AGENTS.md` exists for monorepo-wide rules, including general
    TypeScript tooling guidance, the shared release process, and the rule:
    run `task reindex` before editing `packages/**/*.ts`.
  - `packages/ts/AGENTS.md` exists for `@responsibleapi/ts`-specific OpenAPI
    3.1 / DSL rules.
  - Root `.agents/skills/` contains the source repo skills.
  - Root `.codex/` contains the source repo `code-review-graph` MCP config and
    session-start hook, scoped to this monorepo.
  - Root `task reindex` runs `uvx code-review-graph build`.
  - `.code-review-graph/` is ignored by git.
- `packages/ts` is copied from `/Users/adelnizamutdinov/projects/responsibleapi/`
  using the whitelist in this plan, with no source `.npmrc`, `bun.lock`,
  generated artifacts, caches, editor files, or secrets.
- `@responsibleapi/ts` is prepared as the first monorepo release:
  - `packages/ts/package.json` is bumped from `1.0.7` to `1.0.8`.
  - Repository, homepage, and bugs metadata point at this monorepo and
    `packages/ts`.
  - Package-local modern tooling remains package-local.
- `@responsibleapi/hono` is prepared as the next maintained package release:
  - `packages/hono/package.json` is bumped to `1.1.2`.
  - Its publish flow matches the `ts` publish flow, including
    `bun publish --access public`, a manual `publish:dry-run` task, and a
    package-scoped release tag.
- Root Taskfile behavior is explicit:
  - Root `check` depends only on maintained package checks: `ts:check` and
    `hono:check`.
  - Legacy `generator`, `cli`, and `website` checks are not part of root
    `check`.
  - Root `publish`, `deploy`, and `release` tasks are removed.
  - Root `release:ts` publishes `@responsibleapi/ts@1.0.8` and creates the
    annotated tag `ts-v1.0.8`.
  - Root `release:hono` publishes `@responsibleapi/hono@1.1.2` and creates the
    annotated tag `hono-v1.1.2`.
  - Dry-run tasks remain available but are not dependencies of release tasks.
  - The publish guard script is copied unmodified from the source repo and
    enforces publishing only from a clean `master` worktree.
- Lockfile references are consistent:
  - `bun install` is run from the monorepo root after `packages/ts/package.json`
    is in place.
  - The root `bun.lock` is the only lockfile.
  - Every `bun.lockb` reference in the repo is replaced with `bun.lock`.
- Legacy docs are moved out of the root public path:
  - Root `TUTORIAL.md`, `REFERENCE.md`, and `examples/` move to
    `packages/cli/TUTORIAL.md`, `packages/cli/REFERENCE.md`, and
    `packages/cli/examples/`.
  - All broken links, path strings, checks, and docs references caused by that
    move are fixed. Use `code-review-graph` where useful and `rg` text search
    regardless, because `.kdl` examples may be referenced as string paths.
  - Root `README.md` is rewritten around `@responsibleapi/ts` and
    `@responsibleapi/hono`, with no legacy KDL CLI or website path mentioned.
- Validation passes before publishing:
  - Source baseline is known by running source repo checks before copying.
  - In this monorepo, `task reindex`, `task check`, `task ts:build`,
    `task hono:build`, and the `packages/ts` built-output import smoke test all
    pass.
- Publishing is completed from a committed, clean `master` worktree:
  - `task release:ts` publishes `@responsibleapi/ts@1.0.8`.
  - `task release:hono` publishes `@responsibleapi/hono@1.1.2`.
  - Fresh registry verification clears relevant Bun/npm caches first, then uses
    `bun info @responsibleapi/ts version` and
    `bun info @responsibleapi/hono version`, falling back to `npm view` only if
    Bun cannot return the needed metadata.
- Legacy npm packages are deprecated after both maintained releases succeed:
  - Deprecate `@responsibleapi/cli@"<=0.4.7"`.
  - If `@responsibleapi/generator` exists on npm, deprecate it too.
  - Prefer Bun for deprecation if supported; otherwise use npm.
  - Use this message for both packages:
    `Deprecated: use @responsibleapi/ts for the TypeScript DSL and OpenAPI 3.1 compiler.`
  - Verify deprecation through fresh registry data, preferring Bun and falling
    back to `npm view`.

## Phase 1: Bring In Agentic Context First

This should be the first migration step.

- Add the source repo's local agent skills into this repository:
  - Copy `.agents/skills/debug-issue/SKILL.md`.
  - Copy `.agents/skills/explore-codebase/SKILL.md`.
  - Copy `.agents/skills/refactor-safely/SKILL.md`.
  - Copy `.agents/skills/review-changes/SKILL.md`.
  - Do not copy `.DS_Store`.
- Add root `AGENTS.md` for monorepo-wide behavior:
  - General TypeScript tooling guidance.
  - Shared release process.
  - The rule: run `task reindex` before editing `packages/**/*.ts`.
- Add the source repo's `AGENTS.md` as `packages/ts/AGENTS.md` and keep
  `@responsibleapi/ts`-specific OpenAPI 3.1 / DSL rules there.
- Adapt `packages/ts/AGENTS.md` for the package layout:
  - `src/**/*` means `packages/ts/src/**/*` from the root, or just `src/**/*`
    when commands run in `packages/ts`.
  - `package.json`, `Taskfile.yaml`, and `bunfig.toml` are package-local files.
  - `task check` should be run through `task ts:check` from the root or through
    `task check` from `packages/ts`.
- Merge the source `.codex/config.toml` into root `.codex/config.toml` so the
  `code-review-graph` MCP server is available for the repo.
- Merge `.codex/hooks.json` so the source repo session-start hook applies in
  this monorepo.
- Add root `task reindex` as `uvx code-review-graph build`.
- Add `.code-review-graph/` to `.gitignore`.
- Keep `.codex/` and `.agents/` in git as intended repo behavior.
- Do not copy `.task/`, `.code-review-graph/graph.db`, `node_modules/`, `dist/`,
  `coverage/`, `.idea/`, `.zed/`, `.DS_Store`, or `.npmrc`.

## Phase 2: Copy The Package

Copy the source package into `packages/ts` with a whitelist rather than a broad
directory copy.

Copy:

- `src/`
- `docs/`
- `scripts/`
- `README.md`
- `TODO.md`
- `UNLICENSE`
- `logo.svg`
- `package.json`
- `tsconfig.json`
- `tsconfig.build.json`
- `.oxfmtrc.jsonc`
- `oxlint.config.ts`
- `bunfig.toml`
- `Taskfile.yaml`
- `taskfile.md`

Do not copy:

- `.git/`
- `node_modules/`
- `dist/`
- `coverage/`
- `.task/`
- `.code-review-graph/`
- `.idea/`
- `.zed/`
- `.DS_Store`
- `.npmrc`
- source repo `bun.lock`

The monorepo root `bun.lock` is the authoritative lockfile after install.

## Phase 3: Package Metadata Cleanup

Update `packages/ts/package.json` after copying.

- Keep `"name": "@responsibleapi/ts"`.
- Bump version for the first monorepo release from `1.0.7` to `1.0.8`.
- Keep `"type": "module"`, `"exports"`, `"types"`, `"files"`, and
  `"publishConfig": { "access": "public" }`.
- Keep `"engines": { "node": ">=22.18.0" }`.
- Update repository metadata away from the source repo:
  - `repository.url`: `git+https://github.com/responsibleapi/responsible.git`
  - `repository.directory`: `packages/ts`
  - `homepage`: monorepo `packages/ts` README URL
  - `bugs.url`: monorepo issues URL
- Keep package-local `UNLICENSE` unless the project decision is to relicense the
  new package to match the older MIT packages.
- Keep package-local dev dependencies for the new toolchain. Do not move
  `oxlint`, `oxfmt`, TypeScript 6, or source-only validators to root unless the
  whole monorepo is being migrated.

## Phase 4: Dependency Install And Lockfile

- Run `bun install` at the monorepo root after `packages/ts/package.json` is in
  place.
- Commit the resulting root `bun.lock` changes.
- Do not keep a nested `packages/ts/bun.lock`.
- Fix `Taskfile.common.yaml` to use `../../bun.lock` instead of
  `../../bun.lockb`, because the repo no longer has `bun.lockb`.
- Replace every remaining `bun.lockb` reference in the repo with `bun.lock`.
- Leave eslint/prettier root dependencies in place while legacy packages still
  use `Taskfile.common.yaml`.
- After legacy packages are removed or migrated, do a separate cleanup to remove
  root eslint/prettier config and dependencies.

## Phase 5: Taskfile Nesting

Keep `packages/ts/Taskfile.yaml` package-local and add it to the root Taskfile.

Root include:

```yaml
includes:
  ts:
    taskfile: packages/ts/Taskfile.yaml
    dir: packages/ts
```

Root `check` should include:

```yaml
tasks:
  check:
    deps:
      - hono:check
      - ts:check
```

Do not keep root-wide `publish`, `deploy`, or `release` tasks. Releases are
package-specific root tasks:

```yaml
tasks:
  release:ts:
    cmds:
      - task: publish:auth
      - task: publish:guard
      - task: ts:publish

  release:hono:
    cmds:
      - task: publish:auth
      - task: publish:guard
      - task: hono:publish
```

Keep shared release preflights as root tasks:

```yaml
tasks:
  publish:auth:
    cmd: bun pm whoami

  publish:guard:
    cmd: bun scripts/publish-guard.ts
```

Copy `scripts/publish-guard.ts` unmodified from the source repo. It enforces a
clean worktree on `master`.

Inside `packages/ts/Taskfile.yaml`:

- Keep `check`, `build`, `publish:dry-run`, and `publish`.
- Include `scripts/**/*.ts`, `package.json`, `tsconfig*.json`,
  `.oxfmtrc.jsonc`, `oxlint.config.ts`, and `bunfig.toml` in relevant task
  sources, not only `src/**/*.ts`.
- Preserve package scripts for `fmt` and `fmt:check`. Expose them as Taskfile
  tasks if root-level access is useful, but do not make formatting part of
  `check` unless that is an intentional policy change.
- Change publish tags from bare `1.0.8` style tags to package-scoped monorepo
  tags, specifically `ts-v1.0.8`.
- Keep `publish:dry-run` available, but do not make `publish` or `release:ts`
  depend on it.

Inside `packages/hono/Taskfile.yaml`:

- Keep `check`, `build`, `publish:dry-run`, and `publish`.
- Match the `ts` publish flow:
  - Publish with `bun publish --access public`.
  - Create an annotated package-scoped tag, specifically `hono-v1.1.2` for this
    migration.
  - Keep `publish:dry-run` available, but do not make `publish` or
    `release:hono` depend on it.

## Phase 6: Validation

Before copying, run the source repo checks once so the source baseline is known:

```sh
cd /Users/adelnizamutdinov/projects/responsibleapi
task reindex
task check
task build
task publish:dry-run
```

After copying and installing from the monorepo root:

```sh
task reindex
task ts:check
task ts:build
task ts:publish:dry-run
task hono:check
task hono:build
task hono:publish:dry-run
task check
```

Add a package smoke test after build:

```sh
cd packages/ts
bun -e 'const m = await import("./dist/index.js"); console.log(typeof m.responsibleAPI)'
```

Optional but useful before the first npm publish:

- `bun run test:coverage` from `packages/ts`
- Install the packed package into a temporary project and import
  `@responsibleapi/ts`.

## Phase 7: Docs

- Keep `packages/ts/README.md` as the package README for npm.
- Rewrite root `README.md` so new users install and import
  `@responsibleapi/ts`, and use `@responsibleapi/hono` for Hono validation.
- Do not mention the legacy KDL CLI, generator, examples, or website in root
  `README.md`.
- Move the current KDL docs and examples exactly as:
  - `TUTORIAL.md` to `packages/cli/TUTORIAL.md`.
  - `REFERENCE.md` to `packages/cli/REFERENCE.md`.
  - `examples/` to `packages/cli/examples/`.
- Fix every link, string path, check, and docs reference broken by those moves.
  Use `code-review-graph` where useful and `rg` text search regardless.
- Add or update `packages/cli/README.md` with a clear deprecation notice and a
  link to `@responsibleapi/ts`.
- Update examples in maintained docs to show the TypeScript DSL as the primary
  path.
- Keep the Hono README separate unless Hono examples need to reference the new
  package.
- The website is out of scope for the maintained root docs and root checks.

## Phase 8: Publishing Process

Release flow for `@responsibleapi/ts` from the monorepo:

1. Verify npm auth without committing auth material: `task publish:auth`.
2. Check the currently published version: `bun info @responsibleapi/ts version`.
3. Bump `packages/ts/package.json`.
4. Run `task ts:check`.
5. Optionally run `task ts:publish:dry-run` and inspect the payload.
6. Commit the package, Taskfile, lockfile, and docs changes.
7. Run `task release:ts`.
8. Push the commit and tags:
   `git push --follow-tags`.
9. Clear relevant Bun/npm caches and verify the registry version:
   `bun info @responsibleapi/ts version`.

Release flow for `@responsibleapi/hono` from the monorepo:

1. Verify npm auth without committing auth material: `task publish:auth`.
2. Check the currently published version:
   `bun info @responsibleapi/hono version`.
3. Bump `packages/hono/package.json` to `1.1.2`.
4. Run `task hono:check`.
5. Optionally run `task hono:publish:dry-run` and inspect the payload.
6. Commit the package, Taskfile, lockfile, and docs changes.
7. Run `task release:hono`.
8. Push the commit and tags:
   `git push --follow-tags`.
9. Clear relevant Bun/npm caches and verify the registry version:
   `bun info @responsibleapi/hono version`.

The release flow should:

- Build from source.
- Refuse missing npm auth.
- Refuse publishing from the wrong branch.
- Refuse publishing with a dirty worktree.
- Publish with `--access public`.
- Create an annotated package-scoped tag.

Use `npm view` only as fallback when Bun cannot return the needed registry
metadata.

## Phase 9: Deprecate Legacy Npm Packages

This is the final step, after `@responsibleapi/ts@1.0.8` and
`@responsibleapi/hono@1.1.2` are published and verified.

- Deprecate `@responsibleapi/cli`:

```sh
npm deprecate @responsibleapi/cli@"<=0.4.7" "Deprecated: use @responsibleapi/ts for the TypeScript DSL and OpenAPI 3.1 compiler."
```

- If `@responsibleapi/generator` exists on npm, deprecate it with the same
  message.
- Prefer Bun for deprecation if Bun supports it. Fall back to npm if it does
  not.
- Verify deprecation through fresh registry data, preferring Bun and falling
  back to `npm view`.

## Migration Risks

- Secret leakage: never copy the source `.npmrc`.
- Publish version collision: npm will reject `@responsibleapi/ts@1.0.8` or
  `@responsibleapi/hono@1.1.2` if either already exists.
- Tag collision: source repo used bare version tags; monorepo should use
  package-scoped tags. This migration uses `ts-v1.0.8` and `hono-v1.1.2`.
- License mismatch: older packages are MIT; new package is Unlicense.
- Toolchain split: root still has eslint/prettier and TS 5.7; `packages/ts`
  uses oxlint/oxfmt and TS 6.
- Website coupling: `packages/website` still imports the old KDL generator, but
  the website is out of the maintained root check and release flow.
- `.codex` scope: root hooks affect every session in this monorepo.
- Lockfile drift: source `bun.lock` must not replace the monorepo root
  `bun.lock`.
- Docs move blast radius: `.kdl` examples may be referenced as string paths, so
  `rg` verification is required even if `code-review-graph` is available.

## Open Questions

- Should the old `responsibleapi/ts` source repo be archived after the first
  monorepo publish?
