#!/usr/bin/env bash
# shellcheck disable=SC2034
# Shared helpers for relath local scripts. Source from repo root:  source scripts/lib-relath.sh

relath_repo_root() {
  local here
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  printf '%s' "$here"
}

relath_require_java() {
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    local home
    home="$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home -v 21 2>/dev/null || /usr/libexec/java_home 2>/dev/null || true)"
    if [[ -n "$home" ]]; then
      export JAVA_HOME="$home"
      export PATH="$JAVA_HOME/bin:$PATH"
    fi
  fi
  if ! command -v java >/dev/null 2>&1; then
    echo "JDK not found. Install e.g.:  brew install openjdk@17"
    echo "Then:  export PATH=\"/opt/homebrew/opt/openjdk@17/bin:\$PATH\""
    exit 1
  fi
  java -version 2>&1 | head -1
}

relath_kill_tcp_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Killing PID(s) on port $port: $pids"
    kill -9 $pids 2>/dev/null || true
  fi
}
