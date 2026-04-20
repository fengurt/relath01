#!/usr/bin/env bash
set -euo pipefail

# Stops local dev processes and Docker Compose stack, removes Maven build output, optional data volumes.
# Usage:
#   ./scripts/relath-clean-restart.sh           # soft: compose down, kill dev ports, mvn clean
#   RELATH_PRUNE_VOLUMES=1 ./scripts/relath-clean-restart.sh   # also docker volume prune for neo4j/mysql (destructive)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib-relath.sh
source "$ROOT/scripts/lib-relath.sh"

cd "$ROOT"

echo "== Docker Compose: down =="
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  if [[ "${RELATH_PRUNE_VOLUMES:-0}" == "1" ]]; then
    docker compose down -v --remove-orphans
  else
    docker compose down --remove-orphans
  fi
else
  echo "(docker compose not available — skip)"
fi

echo "== Kill common dev ports (API / Vite) =="
relath_kill_tcp_port 8080
relath_kill_tcp_port 5173
relath_kill_tcp_port 5174

echo "== Maven clean (backend) =="
cd "$ROOT/backend"
relath_require_java
./mvnw clean

echo "== Done. Clean state. Next:"
echo "  Tests:     ./scripts/relath-test.sh"
echo "  Stack:     docker compose up -d neo4j mysql redis"
echo "  API run:   ./scripts/relath-run-backend.sh"
