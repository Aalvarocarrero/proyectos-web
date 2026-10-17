#!/usr/bin/env bash
set -euo pipefail
mkdir -p .ci-output
python3 ci/verify-source.py
node scripts/build-farm-learning.mjs > .ci-output/standalone.log 2>&1
python3 ci/verify-source.py
node --test --test-concurrency=1 tests/farm-learning*.test.mjs > .ci-output/focused.log 2>&1
# The official Sites helper delegates exactly to npm run build. Use this tracked
# build script on the external runner, which does not have the Sites plugin.
npm run build > .ci-output/build.log 2>&1
set +e
node --test --test-concurrency=1 tests/*.test.mjs > .ci-output/global-tests.log 2>&1
test_status=$?
set -e
python3 ci/package-build.py "$test_status"
exit "$test_status"
