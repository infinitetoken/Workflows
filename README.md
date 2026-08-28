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

Pin to a tag (`@v1`), not `@main` — a bad edit to a `@main`-referenced workflow breaks every consuming repo's CI simultaneously on their next run. Bump the tag deliberately (`npm run release:patch` etc.) and update consuming repos on your own schedule.

## Adding a new stack

GitHub does not support subdirectories under `.github/workflows/` — files must live flat in that folder. Name new files by the specific toolchain they invoke (`npm-ci.yml`, `pip-ci.yml`, `poetry-ci.yml`), not by language, wherever a language has more than one real package-manager choice. Where it doesn't (e.g. Swift), a language-level name (`swift-ci.yml`) is fine.
