#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$(cd "$DESKTOP_DIR/.." && pwd)"
FRONTEND_ENV_PATH="$FRONTEND_DIR/.env.production"
RENDERER_DIST_DIR_NAME=".next-electron-$(date +%s)"

read_frontend_env() {
  local key="$1"

  if [[ ! -f "$FRONTEND_ENV_PATH" ]]; then
    return 1
  fi

  local line
  line="$(grep -m1 "^${key}=" "$FRONTEND_ENV_PATH" || true)"

  if [[ -z "$line" ]]; then
    return 1
  fi

  printf '%s' "${line#*=}" | sed 's/^"//; s/"$//'
}

export NEXT_DIST_DIR="$RENDERER_DIST_DIR_NAME"
export NEXT_TELEMETRY_DISABLED="1"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-$(read_frontend_env NEXT_PUBLIC_APP_URL 2>/dev/null || true)}"
if [[ -z "${NEXT_PUBLIC_APP_URL}" ]]; then
  export NEXT_PUBLIC_APP_URL="http://127.0.0.1:2616"
fi
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-$(read_frontend_env NEXT_PUBLIC_API_BASE_URL 2>/dev/null || true)}"
if [[ -z "${NEXT_PUBLIC_API_BASE_URL}" ]]; then
  export NEXT_PUBLIC_API_BASE_URL="http://1.15.94.158:2617"
fi

pushd "$FRONTEND_DIR" >/dev/null
npm run build -- --webpack
popd >/dev/null

export RENDERER_DIST_DIR="$RENDERER_DIST_DIR_NAME"
node "$SCRIPT_DIR/copy-renderer.mjs"

rm -rf "$FRONTEND_DIR/$RENDERER_DIST_DIR_NAME"
