#!/usr/bin/env bash
# Wrapper — forwards to the Python sync script in the same directory
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$SCRIPT_DIR/sync-ftp.py" "$@"
