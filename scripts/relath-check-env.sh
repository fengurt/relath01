#!/usr/bin/env bash
# Quick check: Java, Docker, Node (for support / setup).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Java =="
java_st=0
# subshell so relath_require_java exit does not terminate this script
( source "$ROOT/scripts/lib-relath.sh" && relath_require_java ) || java_st=$?

echo
echo "== Docker =="
if command -v docker >/dev/null 2>&1; then
  echo "docker: $(command -v docker)"
  if docker info >/dev/null 2>&1; then
    echo "Docker daemon: OK"
  else
    echo "Docker daemon: not reachable — start **Docker Desktop** and wait until it is idle"
  fi
else
  echo "docker: NOT IN PATH"
  echo "  Install:  brew install --cask docker"
  echo "  Then open the Docker app once; after that,  docker compose  will work"
fi

echo
echo "== Node =="
if command -v node >/dev/null 2>&1; then
  node -v
else
  echo "node: NOT FOUND (optional for web/h5 only)"
fi

echo
if [[ $java_st -ne 0 ]]; then
  echo "Fix Java (see above), then run this script again."
  exit 1
fi
