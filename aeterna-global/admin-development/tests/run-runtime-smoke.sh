#!/usr/bin/env bash
# Isolated, local-only test against the compiled Worker. No hosted changes.
set -euo pipefail
cd "$(dirname "$0")/.."
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-/tmp/aeterna-test-config}" WRANGLER_SEND_METRICS=false CLOUDFLARE_CF_FETCH_ENABLED=false
state=$(mktemp -d /tmp/aeterna-runtime-state.XXXXXX)
mkdir -p .wrangler
config=$(mktemp "$PWD/.wrangler/aeterna-qa.XXXXXX.json")
export AETERNA_QA_CONFIG="$config"
node --input-type=module - <<'JS'
import fs from 'node:fs';import path from 'node:path';
const c=JSON.parse(fs.readFileSync('dist/server/wrangler.json','utf8'));
c.main=path.resolve('dist/server/index.js');c.assets.directory=path.resolve('dist/client');
c.vars={AETERNA_ADMIN_USER_IDS:'["fixture-owner"]',AETERNA_TRUSTED_SITES_DISPATCH:'1'};
fs.writeFileSync(process.env.AETERNA_QA_CONFIG,JSON.stringify(c));
JS
pid=''
cleanup(){ if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; fi; rm -f "$config"; rm -rf "$state"; }
trap cleanup EXIT
for sql in drizzle/*.sql; do node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config "$config" --persist-to "$state" --file "$sql" >"$state/migration.log" 2>&1; done
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config "$config" --local --persist-to "$state" --ip 127.0.0.1 --port 4325 --inspector-port 0 >"$state/worker.log" 2>&1 &
pid=$!
ready=false
for i in $(seq 1 40); do if curl -sS http://127.0.0.1:4325/ >/dev/null 2>&1; then ready=true; break; fi; sleep 1; done
if [[ "$ready" != true ]]; then cat "$state/worker.log"; exit 1; fi
AETERNA_TEST_ORIGIN=http://127.0.0.1:4325 node tests/runtime-smoke.mjs
