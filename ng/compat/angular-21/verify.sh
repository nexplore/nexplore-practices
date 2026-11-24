#!/usr/bin/env bash
# Builds and tests this Angular 21.2 app against the practices libraries in ng/dist.
# Run `npm run build-all` in ng/ first (the CI runs it after ./build.sh BuildPackAll).
set -euo pipefail

app_dir="$(cd "$(dirname "$0")" && pwd)"
dist_dir="$(cd "$app_dir/../../dist" && pwd)"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

for lib in "$dist_dir"/practices-*/; do
    npm pack "$lib" --pack-destination "$work_dir" --silent > /dev/null
done

# Run outside of the repository: inside ng/, Node and the bundler would fall back to ng/node_modules (Angular 22)
# for every package that is missing here.
mkdir "$work_dir/app"
cp -r "$app_dir/src" "$app_dir"/*.json "$work_dir/app/"
cd "$work_dir/app"

npm ci --no-audit --no-fund
# No --legacy-peer-deps: npm has to accept the declared peer ranges with the Angular 21 versions of package.json
npm install --no-save --no-audit --no-fund "$work_dir"/*.tgz
npx ng build
npx ng test
