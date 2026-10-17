#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
case "${1:-}" in dry-run|deploy) mode="$1";; *) echo 'Usage: bash deployment/promotion.sh dry-run|deploy'; exit 64;; esac
node -e 'if(Number(process.versions.node.split(".")[0])<22)throw Error("Node22+ required")'
if find . -path './node_modules' -prune -o -type f \( -name '.env' -o -name '.env.*' -o -name '.dev.vars' -o -name '.dev.vars.*' \) -print | grep -q .; then
  echo 'Stop: local environment/secret files found. Use this clean release directory without them.' >&2; exit 1
fi
node deployment/verify.mjs
unset CLOUDFLARE_ENV
export CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false WRANGLER_SEND_METRICS=false
args=(deploy --config dist/server/wrangler.promotion.json --keep-vars --message 'Venezuela Agro reviewed production update; verified owner grant preserved')
if [[ "$mode" == dry-run ]]; then args+=(--dry-run --outdir wrangler-dry-run); fi
exec npx --yes wrangler@4.92.0 "${args[@]}"
