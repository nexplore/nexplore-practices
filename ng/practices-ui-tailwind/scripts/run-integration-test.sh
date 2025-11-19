#!/usr/bin/env bash
set -euo pipefail

# Enhanced step/error logging additions
CURRENT_STEP=""
CURRENT_LOG=""

on_error() {
	local line=$1
	local code=$2
	echo "" >&2
	printf "\e[31m[IT][ERROR] Step failed (exit %s) at line %s\e[0m\n" "$code" "$line" >&2
	if [[ -n "$CURRENT_STEP" ]]; then
		printf "\e[31m[IT][ERROR] During: %s\e[0m\n" "$CURRENT_STEP" >&2
	fi
	if [[ -f "$CURRENT_LOG" ]]; then
		printf "\e[33m[IT] ---- Begin log (%s) ----\e[0m\n" "$CURRENT_LOG" >&2
		local lines
		lines=$(wc -l < "$CURRENT_LOG" || echo 0)
		if (( lines > 400 )); then
			tail -n 400 "$CURRENT_LOG" >&2
			printf "\e[33m[IT] (truncated; full log at %s)\e[0m\n" "$CURRENT_LOG" >&2
		else
			cat "$CURRENT_LOG" >&2
		fi
		printf "\e[33m[IT] ---- End log ----\e[0m\n" >&2
	fi
	printf "\e[31m[IT] Integration test FAILED\e[0m\n" >&2
	exit $code
}

trap 'on_error $LINENO $?' ERR

# Integration test script for practices-ui-tailwind schematics.
# Steps:
# 1. Clean previous tmp + build artifacts
# 2. Build library + schematics (CommonJS)
# 3. Pack tarball
# 4. Create fresh Angular app in tmp area
# 5. Install packed tarball
# 6. Run add-component schematic (sample: select first two components or all)
# 7. Verify expected files and hash DB
# 8. Print concise summary

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)" # points to ng/
LIB_DIR="$ROOT_DIR/practices-ui-tailwind"
DIST_DIR="$ROOT_DIR/dist/practices-ui-tailwind"
TMP_ROOT="$ROOT_DIR/tmp/integration-test"
APP_NAME="schematics-it-app"
APP_DIR="$TMP_ROOT/$APP_NAME"
LOG_DIR="$TMP_ROOT/logs"

slug() { echo "$1" | tr ' ' '-' | tr -cd '[:alnum:]-_'; }

run_step() {
	local desc="$1"; shift
	CURRENT_STEP="$desc"
	local slugged; slugged=$(slug "$desc")
	CURRENT_LOG="$LOG_DIR/${slugged}.log"
	log "$desc"
	local start_ts end_ts dur
	start_ts=$(date +%s%3N 2>/dev/null || date +%s)
	# shellcheck disable=SC2086
	set +e
	( eval "$@" ) 2>&1 | tee "$CURRENT_LOG"; cmd_ec=${PIPESTATUS[0]}
	set -e
	if [ ${cmd_ec} -ne 0 ]; then
		# Force non-zero to trigger ERR trap while retaining log
		return ${cmd_ec}
	fi
	end_ts=$(date +%s%3N 2>/dev/null || date +%s)
	if [[ $start_ts =~ ^[0-9]+$ && $end_ts =~ ^[0-9]+$ ]]; then
		dur=$(( end_ts - start_ts ))
		ok "$desc (${dur}ms)"
	else
		ok "$desc"
	fi
}

log() { printf "\e[36m[IT] %s\e[0m\n" "$*"; }
fail() { printf "\e[31m[IT][FAIL] %s\e[0m\n" "$*"; exit 1; }
ok() { printf "\e[32m[IT][OK] %s\e[0m\n" "$*"; }

log "Cleaning previous tmp + dist snapshot"
rm -rf "$TMP_ROOT/schematics-it-app/public" || true
rm -rf "$TMP_ROOT/schematics-it-app/src" || true
rm -rf "$TMP_ROOT/schematics-it-app/.practices-ui" || true
if [ -d "$TMP_ROOT/schematics-it-app" ]; then
  find "$TMP_ROOT/schematics-it-app" -maxdepth 1 -type f ! -name '.*' -print0 | xargs -0 rm -f -- || true
fi
rm -rf "$TMP_ROOT/logs" || true

mkdir -p "$TMP_ROOT" "$LOG_DIR"

# Optional: clean previous dist schematics build to force rebuild
rm -rf "$DIST_DIR/schematics" || true

run_step "Building schematics only" "cd '$LIB_DIR' && pnpm run --silent build:schematics"

# Validate that postbuild injected features list into ng-add schema.json
SCHEMA_DIST="$DIST_DIR/schematics/ng-add/schema.json"
if [ -f "$SCHEMA_DIST" ]; then
  if ! grep -q 'component:' "$SCHEMA_DIST"; then
    fail "Features list not injected into ng-add/schema.json"
  fi
  ok "Features list injected into ng-add/schema.json"
else
  fail "Dist ng-add/schema.json not found after schematics build"
fi

# Ensure package.json exists in dist for packing (copy from source)
run_step "Preparing dist package.json" "cp '$LIB_DIR/package.json' '$DIST_DIR/package.json'"

run_step "Packing library" "cd '$DIST_DIR' && PKG_TGZ=\$(npm pack --quiet) && echo \$PKG_TGZ > PACKED_NAME"
PKG_TGZ_NAME=$(cat "$DIST_DIR/PACKED_NAME")
PKG_TGZ_PATH="$DIST_DIR/$PKG_TGZ_NAME"
[ -f "$PKG_TGZ_PATH" ] || fail "Tarball not found at $PKG_TGZ_PATH"
ok "Tarball: $PKG_TGZ_NAME"

run_step "Scaffolding Angular workspace" "cd '$TMP_ROOT' && npx --yes @angular/cli@latest new $APP_NAME --skip-git --package-manager=npm --routing=false --style=css"

run_step "Installing packed library" "cd '$APP_DIR' && pnpm install --no-audit --no-fund --legacy-peer-deps '$PKG_TGZ_PATH'"

DEFAULT_DEST_ROOT="src/practices-ui-tailwind"
# Run ng-add schematic (accept defaults) before adding a specific component.
run_step "Schematic ng-add (default options)" "cd '$APP_DIR' && npx ng g @nexplore/practices-ui-tailwind:ng-add --dest $DEFAULT_DEST_ROOT"

# Validate ng-add effects: provider injection (main or app.config), optional theme file(s), shell component folder.
log "Validating ng-add results"
MAIN_TS="$APP_DIR/src/main.ts"
APP_CONFIG_TS="$APP_DIR/src/app/app.config.ts"
if grep -q 'providePracticesTailwind' "$MAIN_TS" || grep -q 'providePracticesTailwind' "$APP_CONFIG_TS"; then
	ok "Provider detected"
else
	fail "Provider not injected (checked main.ts & app.config.ts)"
fi

THEME_DIR="$APP_DIR/$DEFAULT_DEST_ROOT/lib"
if [ -d "$THEME_DIR" ]; then
	THEME_FOUND=$(find "$THEME_DIR" -maxdepth 1 -type f -name 'theme*.css' | head -n1 || true)
	if [ -n "$THEME_FOUND" ]; then
		ok "Theme file present: $(basename "$THEME_FOUND")"
	else
		log "No theme*.css copied (allowed if none in snapshot)"
	fi
else
	log "Theme destination directory missing (allowed)"
fi

SHELL_DIR="$APP_DIR/$DEFAULT_DEST_ROOT/lib/shell"
[ -d "$SHELL_DIR" ] || fail "Shell component directory missing: $SHELL_DIR"
ok "ng-add basic validations passed"

# Validate that global styles entry has been cached and points to /src/styles.css (default Angular workspace)
HASH_DB="$APP_DIR/.practices-ui/schematics.hashdb.json"
[ -f "$HASH_DB" ] || fail "Hash DB not created after ng-add"
CACHED_STYLES=$(node -e "const db=require('$HASH_DB');process.stdout.write(db.globalStylesEntry||'')")
if [ -z "$CACHED_STYLES" ]; then
  fail "globalStylesEntry not cached in hash DB after ng-add"
fi
ok "Cached global styles entry: $CACHED_STYLES"

# Determine first component in manifest for targeted test
MANIFEST_PATH="$DIST_DIR/schematics/add-component/files/component-manifest.json"
[ -f "$MANIFEST_PATH" ] || fail "Manifest missing in dist"
FIRST_COMPONENT=$(node -e "const m=require('$MANIFEST_PATH');console.log(Object.keys(m.components)[0]||'');")
[ -n "$FIRST_COMPONENT" ] || fail "No components found in manifest"

run_step "Schematic add-component ($FIRST_COMPONENT)" "cd '$APP_DIR' && npx ng g @nexplore/practices-ui-tailwind:add-component --names $FIRST_COMPONENT --rewrite-imports --dest $DEFAULT_DEST_ROOT"

log "Validating generated files"
# Determine destination root from hash DB (may differ from provided dest if already initialized)
DEST_ROOT=$(node -e "const db=require('$HASH_DB');process.stdout.write(db.dest||'$DEFAULT_DEST_ROOT')")
EXPECTED_DIR="$APP_DIR/$DEST_ROOT/lib/$FIRST_COMPONENT"
[ -d "$EXPECTED_DIR" ] || fail "Expected component directory missing: $EXPECTED_DIR (dest root: $DEST_ROOT)"
TS_COUNT=$(find "$EXPECTED_DIR" -name '*.ts' | wc -l | tr -d ' ')
[ "$TS_COUNT" -gt 0 ] || fail "No TypeScript files copied"

# HASH_DB defined above
[ -f "$HASH_DB" ] || fail "Hash DB not created"
RUNS_COUNT=$(node -e "const db=require('$HASH_DB');console.log(db.runs.length)")
[ "$RUNS_COUNT" -ge 1 ] || fail "Hash DB runs not recorded"
ok "Files and hash DB validated"

# Check CSS @reference rewrites against cached global styles entry (best-effort)
log "Validating CSS @reference rewrites"
REF_FILES=$(grep -RIl --include='*.css' '@reference' "$APP_DIR/$DEST_ROOT/lib" || true)
if [ -z "$REF_FILES" ]; then
  log "No CSS files with @reference found in generated output (allowed)"
else
  while IFS= read -r f; do
    # Compute expected relative path from file directory to cached global styles entry
    EXPECTED_REL=$(node -e "const p=require('path').posix;const to='$CACHED_STYLES'; const from=p.dirname(process.argv[1]); let rel=p.relative(from,to); if(!rel.startsWith('.')&&!rel.startsWith('/')) rel='./'+rel; process.stdout.write(rel);" "$f" )
    if ! grep -q "@reference .*['\"]${EXPECTED_REL}['\"]" "$f"; then
      echo "File: $f"; echo "Expected relative: $EXPECTED_REL";
      fail "CSS @reference not rewritten as expected"
    fi
  done <<< "$REF_FILES"
  ok "CSS @reference rewrites validated"
fi

run_step "Schematic add-component re-run ($FIRST_COMPONENT)" "cd '$APP_DIR' && npx ng g @nexplore/practices-ui-tailwind:add-component --names $FIRST_COMPONENT --rewrite-imports --dest $DEFAULT_DEST_ROOT"
RERUN_LOG="$CURRENT_LOG"
CREATED_LINES=$(grep -c '^CREATE ' "$RERUN_LOG" 2>/dev/null || true)
if [ -z "$CREATED_LINES" ]; then CREATED_LINES=0; fi
if [ "$CREATED_LINES" -ne 0 ]; then
	fail "Unexpected CREATE lines ($CREATED_LINES) on idempotent re-run"
fi
# Extract summary line for additional assurance
SUMMARY_LINE=$(grep '\[add-component\] Completed' "$RERUN_LOG" || true)
if [ -z "$SUMMARY_LINE" ]; then
	fail "Missing completion summary in re-run log"
fi
IDENTICAL_COUNT=$(echo "$SUMMARY_LINE" | sed -E 's/.*Identical=([0-9]+).*/\1/')
if ! [[ $IDENTICAL_COUNT =~ ^[0-9]+$ ]]; then
	fail "Could not parse Identical count from summary: $SUMMARY_LINE"
fi
if [ "$IDENTICAL_COUNT" -lt 1 ]; then
	fail "Identical count unexpectedly low: $IDENTICAL_COUNT"
fi
ok "Idempotent re-run confirmed (Identical=$IDENTICAL_COUNT)"

log "Summary"
cat <<EOF
--------------------------------------------------
Integration Test Result: SUCCESS
Component: $FIRST_COMPONENT
Files (ts): $TS_COUNT
Runs Recorded: $RUNS_COUNT
Tarball: $PKG_TGZ_NAME
App Dir: $APP_DIR
Logs Directory: $LOG_DIR
Last Step Log: $CURRENT_LOG
Detailed logs per step: $LOG_DIR/*.log
--------------------------------------------------
EOF

exit 0
