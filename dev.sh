#!/usr/bin/env bash
# Runs both halves together for local development.
# A standalone script rather than a root package.json "dev" script — the
# Nest package.json's scripts are out of scope for this build (see web/README.md
# and web/VERIFICATION.md), so nothing there gets edited for convenience alone.
set -e
trap 'kill 0' EXIT

pnpm start:dev &
pnpm --filter web dev &

wait
