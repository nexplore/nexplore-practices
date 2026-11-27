#!/usr/bin/env bash
# Builds and tests this Angular 21.2 app against the practices libraries in ng/dist.
# Run `npm run build-all` in ng/ first (the CI runs it after ./build.sh BuildPackAll).
set -euo pipefail

# Newest ng-select 21: its inputs are writable signals, while 21.0.0 (package.json) has input signals
latest_ng_select_21="21.8.2"

app_dir="$(cd "$(dirname "$0")" && pwd)"
dist_dir="$(cd "$app_dir/../../dist" && pwd)"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

for lib in "$dist_dir"/practices-*/; do
    npm pack "$lib" --pack-destination "$work_dir" --silent > /dev/null
done

# Run outside of the repository: inside ng/, Node and the bundler would fall back to ng/node_modules (Angular 22)
# for every package that is missing here. The workspace .npmrc (ignore-scripts, min-release-age) is copied so that
# the same npm hardening applies. Only engine-strict is turned off: the workspace runs on Node 26, which Angular 21 and
# ng-select 21 do not list in their engines (Node ^20 || ^22 || ^24). This check is about the libraries, not Node.
mkdir "$work_dir/app"
cp -r "$app_dir/src" "$app_dir"/*.json "$app_dir/.postcssrc.json" "$app_dir/../../.npmrc" "$work_dir/app/"
export npm_config_engine_strict=false
cd "$work_dir/app"
# Like in an application: Tailwind's automatic source detection skips what .gitignore lists (otherwise it scans
# node_modules and generates utilities from random strings in it)
printf 'node_modules/\ndist/\n' > .gitignore

npm ci --no-audit --no-fund
# No --legacy-peer-deps: npm has to accept the declared peer ranges with the Angular 21 versions of package.json
npm install --no-save --no-audit --no-fund "$work_dir"/*.tgz
npx ng build

# src/styles.css imports the shipped tailwind.css with Tailwind CSS 4.1.0. The app itself uses none of these classes:
# they only exist if the KTBE preset is loaded (bg-dark-sand) and the library sources are scanned (both classes are used
# in practices-ui-ktbe templates).
styles="dist/compat/browser/styles.css"
for class in bg-dark-sand outline-hidden; do
    if ! grep -q "\.$class" "$styles"; then
        echo "$styles does not contain .$class: tailwind.css of practices-ui-ktbe does not work with Tailwind CSS 4.1.0" >&2
        exit 1
    fi
done

npx ng test

echo "Testing again with @ng-select/ng-select@$latest_ng_select_21"
# Install the libraries again in the same command: a separate npm install --no-save would remove them
npm install --no-save --no-audit --no-fund "$work_dir"/*.tgz "@ng-select/ng-select@$latest_ng_select_21"
npx ng test
