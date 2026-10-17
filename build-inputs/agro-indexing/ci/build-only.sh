#!/usr/bin/env bash
set -euo pipefail
mkdir -p .ci-output
ulimit -f 131072
python3 ci/verify-source.py
npm run lint > .ci-output/lint.log 2>&1
./node_modules/.bin/tsc --noEmit --incremental false > .ci-output/typecheck.log 2>&1
node --test --test-concurrency=1 tests/indexing-response-guard.test.mjs tests/portable-auth-worker.test.mjs tests/portable-auth-core.test.mjs tests/portable-auth-boundary.test.mjs tests/production-owner-config.test.mjs > .ci-output/security.log 2>&1
npm run build > .ci-output/build.log 2>&1
node scripts/stage-production-config.mjs > .ci-output/stage-config.log 2>&1
# Build completed before any runtime artifact is packaged; test failures stay failures.
set +e
node ci/check-production-build.mjs > .ci-output/production-html.log 2>&1
html_status=$?
node --test --test-concurrency=1 tests/*.test.mjs > .ci-output/global-tests.log 2>&1
test_status=$?
set -e
python3 ci/package-build.py "$html_status" "$test_status"
if [[ "$html_status" != 0 || "$test_status" != 0 ]]; then exit 1; fi
