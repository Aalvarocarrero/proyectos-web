#!/usr/bin/env bash
set -euo pipefail
mkdir -p .ci-output
ulimit -f 131072
python3 ci/verify-source.py
npm run lint 2>&1 | tee .ci-output/lint.log
./node_modules/.bin/tsc --noEmit --incremental false 2>&1 | tee .ci-output/typecheck.log
node --test --test-concurrency=1 tests/indexing-response-guard.test.mjs tests/portable-auth-worker.test.mjs tests/portable-auth-core.test.mjs tests/portable-auth-boundary.test.mjs tests/production-owner-config.test.mjs 2>&1 | tee .ci-output/security.log
npm run build 2>&1 | tee .ci-output/build.log
node scripts/stage-production-config.mjs 2>&1 | tee .ci-output/stage-config.log
# Build completed before any runtime artifact is packaged; test failures stay failures.
set +e
node ci/check-production-build.mjs 2>&1 | tee .ci-output/production-html.log
html_status=${PIPESTATUS[0]}
node --test --test-concurrency=1 tests/*.test.mjs 2>&1 | tee .ci-output/global-tests.log
test_status=${PIPESTATUS[0]}
set -e
python3 ci/package-build.py "$html_status" "$test_status"
if [[ "$html_status" != 0 || "$test_status" != 0 ]]; then exit 1; fi
