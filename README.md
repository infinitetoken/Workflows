# Workflows

Shared, reusable GitHub Actions workflows for InfiniteToken repos. One canonical definition per stack/task, referenced by every consuming repo instead of copy-pasted.

## Available workflows

| File | Purpose |
| --- | --- |
| `npm-ci.yml` | Install (`npm ci`) + run a package's own `npm run ci` script (lint/test/typecheck/build, as defined per-repo) |
| `npm-publish.yml` | Install + `npm publish` via OIDC trusted publishing (no token required) |

## Usage

In a consuming repo's `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  ci:
    uses: infinitetoken/Workflows/.github/workflows/npm-ci.yml@v1
```

And `.github/workflows/publish.yml`:

```yaml
name: Publish
on:
  push:
    tags: ['v*']
jobs:
  publish:
    uses: infinitetoken/Workflows/.github/workflows/npm-publish.yml@v1
    permissions:
      contents: read
      id-token: write
```

Pin to `@v1` (a major-version alias tag), not `@main` — a bad edit to a `@main`-referenced workflow breaks every consuming repo's CI simultaneously on their next run.

## Tagging scheme

Every release creates two tags:

- An exact, immutable tag (`v1.2.3`) — the real release, never moves.
- A major-version alias (`v1`) — force-repointed at the exact tag on every release via `scripts/move-major-tag.sh`, which `npm run release` calls automatically after pushing.

This means consuming repos that pin `@v1` pick up every future patch/minor release automatically — matching semver's actual contract (patch = non-breaking, minor = additive) and the same convention `actions/checkout@v4` etc. use. `preversion` (`npm run lint`) is what makes that safe to do automatically: nothing gets tagged, let alone force-pushed as the new `v1`, without `actionlint` and `shellcheck` passing first. A breaking change goes out as `release:major` (`npm version major`), which creates `v2.0.0` and moves a *new* `v2` alias — `v1` stays frozen at its last release, so existing consumers are unaffected until they deliberately bump their `uses:` line to `@v2`.

## Prerequisites

Cutting a release runs `preversion` locally (`actionlint` + `shellcheck`) before anything is tagged or pushed — install both first:

```bash
brew install actionlint   # pulls in shellcheck as a dependency
```

## Adding a new stack

GitHub does not support subdirectories under `.github/workflows/` — files must live flat in that folder. Name new files by the specific toolchain they invoke (`npm-ci.yml`, `pip-ci.yml`, `poetry-ci.yml`), not by language, wherever a language has more than one real package-manager choice. Where it doesn't (e.g. Swift), a language-level name (`swift-ci.yml`) is fine.
