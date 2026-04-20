#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib-relath.sh
source "$ROOT/scripts/lib-relath.sh"

cd "$ROOT/backend"
relath_require_java

echo "Running: ./mvnw clean test"
exec ./mvnw clean test "$@"
