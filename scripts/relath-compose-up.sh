#!/usr/bin/env bash
# Starts compose services (Neo4j, mysql, redis, …). Requires Docker Desktop running.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib-relath.sh
source "$ROOT/scripts/lib-relath.sh"

relath_require_docker
cd "$ROOT"
exec docker compose up -d "$@"
