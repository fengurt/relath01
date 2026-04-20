#!/usr/bin/env bash
# shellcheck disable=SC2034
# Shared helpers for relath local scripts. Source from repo root:  source scripts/lib-relath.sh

relath_repo_root() {
  local here
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  printf '%s' "$here"
}

# Prefer Homebrew JDK over macOS '/usr/bin/java' stub.
relath_java_binary_ok() {
  local bin="$1"
  [[ -x "$bin" ]] && "$bin" -version >/dev/null 2>&1
}

relath_activate_java_binary() {
  local bin="$1"
  export JAVA_HOME="$(cd "$(dirname "$bin")/.." && pwd)"
  export PATH="$(dirname "$bin"):$PATH"
}

relath_require_java() {
  local candidates=(
    "/opt/homebrew/opt/openjdk@17/bin/java"
    "/opt/homebrew/opt/openjdk@21/bin/java"
    "/opt/homebrew/opt/openjdk/bin/java"
    "/usr/local/opt/openjdk@17/bin/java"
    "/usr/local/opt/openjdk@21/bin/java"
  )
  local j
  for j in "${candidates[@]}"; do
    if relath_java_binary_ok "$j"; then
      relath_activate_java_binary "$j"
      echo "Using Homebrew JDK: $(command -v java)"
      java -version 2>&1 | head -1
      return 0
    fi
  done

  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    local home
    home="$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home -v 21 2>/dev/null || /usr/libexec/java_home 2>/dev/null || true)"
    if [[ -n "$home" ]] && [[ -x "$home/bin/java" ]] && relath_java_binary_ok "$home/bin/java"; then
      export JAVA_HOME="$home"
      export PATH="$JAVA_HOME/bin:$PATH"
      echo "Using java_home: $(command -v java)"
      java -version 2>&1 | head -1
      return 0
    fi
  fi

  if command -v java >/dev/null 2>&1 && java -version >/dev/null 2>&1; then
    echo "Using PATH java: $(command -v java)"
    java -version 2>&1 | head -1
    return 0
  fi

  echo "JDK 17+ not found or not working (macOS /usr/bin/java stub breaks ./mvnw)."
  echo "Install:  brew install openjdk@17"
  echo "Then add to ~/.zshrc and restart the terminal:"
  echo "  export PATH=\"/opt/homebrew/opt/openjdk@17/bin:\$PATH\""
  echo "Intel Mac:  export PATH=\"/usr/local/opt/openjdk@17/bin:\$PATH\""
  exit 1
}

relath_require_docker() {
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    return 0
  fi
  echo "Docker is not installed or Docker Desktop is not running."
  echo "Install:  brew install --cask docker"
  echo "Then open Docker Desktop once and wait until it finishes starting."
  exit 1
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
