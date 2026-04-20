#!/usr/bin/env bash
set -euo pipefail

# Runs Spring Boot on :8080 using Maven Wrapper (foreground).

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib-relath.sh
source "$ROOT/scripts/lib-relath.sh"

cd "$ROOT/backend"
relath_require_java

echo "Starting relath-backend (Ctrl+C to stop)…"
exec ./mvnw -q spring-boot:run "$@"
