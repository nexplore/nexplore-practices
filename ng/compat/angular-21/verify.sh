#!/usr/bin/env bash
# Builds this Angular 21.2 app against the practices libraries in ng/dist.
# Run `npm run build-all` in ng/ first (the CI runs it after ./build.sh BuildPackAll).
set -euo pipefail

cd "$(dirname "$0")"
dist_dir="$(cd ../../dist && pwd)"
pack_dir="$(mktemp -d)"
trap 'rm -rf "$pack_dir"' EXIT

for lib in "$dist_dir"/practices-*/; do
    npm pack "$lib" --pack-destination "$pack_dir" --silent > /dev/null
done

npm ci --no-audit --no-fund
# No --legacy-peer-deps: npm has to accept the declared peer ranges with the Angular 21 versions of package.json
npm install --no-save --no-audit --no-fund "$pack_dir"/*.tgz
npx ng build
