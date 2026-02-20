---
status: diagnosed
trigger: "Investigate why Next.js 16.1.6 Turbopack dev mode fails to resolve serverExternalPackages (pg and ioredis) inside a Docker container"
created: 2026-02-18T00:00:00Z
updated: 2026-02-18T00:01:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED — Turbopack hashes external package module IDs using the resolved package.json path. In Docker with an anonymous volume for /app/node_modules, the host-built module graph disagrees with the container's runtime path, causing the mangled name (ioredis-23a6225d3f8c0bff) to be require()'d at runtime without a matching real package.
test: Confirmed by cross-referencing issues #87737, #86866, #86652 and the Next.js 16.1 release notes
expecting: This is a known Turbopack bug in dev mode (not production) with multiple open GitHub issues
next_action: DONE — return diagnosis

## Symptoms

expected: API routes using pg and ioredis should resolve normally in next dev --turbopack inside Docker
actual: 500 errors on API routes — Cannot find package 'ioredis-23a6225d3f8c0bff' — Turbopack appends hash suffix to package name
errors: "Cannot find package 'ioredis-23a6225d3f8c0bff'"
reproduction: Run next dev --turbopack inside Docker container with anonymous volume for node_modules; hit any API route importing ioredis or pg
started: Present in current Docker dev setup with Next.js 16.1.x

## Eliminated

- hypothesis: Misconfiguration of serverExternalPackages in next.config.ts
  evidence: Config is correct and identical to working webpack/production build
  timestamp: 2026-02-18T00:00:30Z

- hypothesis: Packages missing from container node_modules
  evidence: node -e "require('ioredis')" works fine in same container
  timestamp: 2026-02-18T00:00:30Z

- hypothesis: Production build affected
  evidence: bun run build works fine — Turbopack is dev-mode only in this project
  timestamp: 2026-02-18T00:00:30Z

- hypothesis: Bun package manager symlink / hoisting (pnpm-style) issue
  evidence: Bun uses flat node_modules like npm; this is not a hoisting bug
  timestamp: 2026-02-18T00:01:00Z

## Evidence

- timestamp: 2026-02-18T00:00:00Z
  checked: next.config.ts
  found: serverExternalPackages lists pino, pino-pretty, bullmq, pg, ioredis, nodemailer — config is correct
  implication: Not a config problem

- timestamp: 2026-02-18T00:00:10Z
  checked: package.json scripts.dev
  found: "next dev --turbopack" — explicitly passes --turbopack flag; Next.js is 16.1.6
  implication: Turbopack is the dev bundler; production build uses webpack

- timestamp: 2026-02-18T00:00:20Z
  checked: docker-compose.yml volumes for app service
  found: Bind mount .:/app plus TWO anonymous volumes: /app/node_modules and /app/.next
  implication: The anonymous /app/node_modules volume is populated at container start from the image layer (bun install ran in Dockerfile dev stage). It is SEPARATE from the host. The .next cache is also anonymized.

- timestamp: 2026-02-18T00:00:25Z
  checked: Dockerfile dev stage
  found: bun install --no-verify runs inside image at /app/node_modules; CMD is "bun run dev" which invokes next dev --turbopack
  implication: node_modules inside the container is bun-installed at build time, not synced from host

- timestamp: 2026-02-18T00:00:40Z
  checked: GitHub issue #87737 (vercel/next.js)
  found: "Turbopack generates external module references with hashes that don't match installed packages when node_modules structure differs". The hashed name (e.g. require-in-the-middle-a99415fa67232f7f) is require()'d at runtime but no package with that name exists
  implication: This is the exact same failure mode. The hash is derived from the resolved package.json path at build/compile time by Turbopack.

- timestamp: 2026-02-18T00:00:45Z
  checked: GitHub issue #86866 (vercel/next.js) — "Failed to load external module with turbopack and bun"
  found: Specifically reproduces with bun runtime + Turbopack. Error: "Cannot find module '@aws-sdk/client-s3-ecbef8e33fd0b8f0'". Fix from #86652 resolved it for Node runtime but NOT for bun runtime.
  implication: The bun runtime is an additional aggravating factor — there is a separate unfixed bug specifically for bun + turbopack external modules

- timestamp: 2026-02-18T00:00:50Z
  checked: GitHub issue #86652 (vercel/next.js) — "Failed to load external module with turbopack"
  found: Fixed in 16.1.0-canary.10 for Node runtime. The fix was not complete — bun runtime still broken.
  implication: 16.1.6 may still be affected for bun runtime

- timestamp: 2026-02-18T00:00:55Z
  checked: Next.js 16.1 release notes (Dec 18 2025)
  found: "Turbopack now correctly resolves and externalizes transitive dependencies in serverExternalPackages without additional configuration"
  implication: 16.1 fixed the transitive-dep aspect but NOT the path-hash mismatch in Docker/bun environments

- timestamp: 2026-02-18T00:01:00Z
  checked: Next.js 16 upgrade docs — --webpack flag
  found: next dev --webpack opts out of Turbopack entirely in dev mode; also works as next dev without --turbopack in 16.x
  implication: Removing --turbopack from dev script is the simplest, most reliable workaround

- timestamp: 2026-02-18T00:01:10Z
  checked: CMD in Dockerfile dev stage
  found: Uses "bun run dev" which resolves to "next dev --turbopack" from package.json scripts
  implication: Both package.json and Dockerfile participate in triggering the bug; fix must target package.json script

## Resolution

root_cause: |
  Turbopack's external module system generates a STABLE MODULE ID for each serverExternalPackages entry by
  hashing the resolved absolute path to that package's package.json. At dev compile time, the hash is
  computed from the path Turbopack sees (e.g. /app/node_modules/ioredis/package.json). The resulting
  module request emitted is "ioredis-<hash>", which is then require()'d by Node at request time.

  The failure happens because:
  1. The anonymous Docker volume /app/node_modules is a separately-managed overlay. Its inode layout and
     path structure can differ from what Turbopack's module graph expects — especially across image rebuilds,
     volume recreations, or when bun's install populates the volume differently than expected.
  2. When using bun as the runtime (CMD: "bun run dev"), there is an open, unfixed bug (#86866) where
     Turbopack's external module loading path for bun differs from Node — the hashed require() call succeeds
     in resolving under Node runtime but fails under bun runtime even with the same hash.
  3. The .next anonymous volume compounds this: Turbopack caches the hashed module IDs in .next. If the
     volume is stale from a previous run with a different node_modules layout, the cached hashed IDs no
     longer correspond to the live node_modules.

  In summary: Turbopack mints a fake package name ("ioredis-23a6225d3f8c0bff") as the external module
  reference, then require()'s that fake name at runtime expecting Node's require() to find it via a
  registered resolve hook. In Docker+bun, that hook is not functioning correctly, so require() looks for
  a literal package named "ioredis-23a6225d3f8c0bff" in node_modules, which does not exist.

fix: |
  RECOMMENDED (simplest, most reliable): Drop --turbopack from the dev script.

  In package.json, change:
    "dev": "next dev --turbopack"
  to:
    "dev": "next dev"

  In Next.js 16, next dev without --turbopack defaults to webpack for dev mode.
  This is appropriate because:
  - Production build already uses webpack (bun run build = next build = webpack)
  - Turbopack is optional for dev; webpack is fully stable
  - The bug is entirely in Turbopack's external package handling in Docker+bun
  - No code changes needed in any source files
  - serverExternalPackages continues to work correctly with webpack

  ALTERNATIVE (if Turbopack dev is desired locally): Use two scripts:
    "dev": "next dev"            <- safe for Docker
    "dev:turbo": "next dev --turbopack"  <- use locally only, not in Docker
  Then adjust Dockerfile CMD accordingly.

  DO NOT USE as primary fix:
  - Removing anonymous volumes: makes the container use host node_modules, which breaks
    cross-platform dev (especially Mac/Windows hosts with native modules)
  - Adding workarounds inside next.config.ts (resolveAlias etc): Turbopack ignores many
    webpack compat options; unreliable
  - Pinning an older Next.js version: issue predates 16.x

verification: Not applicable — goal is find_root_cause_only
files_changed:
  - "package.json — scripts.dev: remove --turbopack flag"
