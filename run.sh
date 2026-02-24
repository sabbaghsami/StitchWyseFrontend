#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"

if [ -x "$VENV_PYTHON" ]; then
  PYTHON_BIN="$VENV_PYTHON"
else
  PYTHON_BIN="${PYTHON_BIN:-python3}"
fi

if [ "$#" -lt 1 ]; then
  echo "Usage: ./run.sh <python_script> [args...]"
  echo "Example: ./run.sh scripts/task.py --dry-run"
  exit 1
fi

SCRIPT_PATH="$1"
shift

case "$SCRIPT_PATH" in
  /*) ;;
  *)
  SCRIPT_PATH="$PROJECT_ROOT/$SCRIPT_PATH"
  ;;
esac

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Error: script not found: $SCRIPT_PATH"
  exit 1
fi

exec "$PYTHON_BIN" "$SCRIPT_PATH" "$@"
