#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${HEADMASTER_REPO_URL:-https://github.com/Pragith/headmaster.git}"
INSTALL_DIR="${HEADMASTER_INSTALL_DIR:-$PWD/headmaster}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required"
  exit 1
fi

if [ ! -d "$INSTALL_DIR/.git" ]; then
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
fi

./bin/headmaster env:init
./bin/headmaster doctor

echo "Headmaster is ready in $INSTALL_DIR"
echo "Next step: ./bin/headmaster up"
