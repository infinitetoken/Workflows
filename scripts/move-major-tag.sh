#!/usr/bin/env bash
# Force-moves the major-version alias tag (e.g. v1) to the commit just released,
# so consumers pinned to @v1 pick up new patches/minors automatically.
# Matches GitHub's own documented convention for versioning actions/workflows.
set -euo pipefail

major="v$(node -p "require('./package.json').version.split('.')[0]")"
git tag -fa "$major" -m "$major"
git push origin "$major" --force
