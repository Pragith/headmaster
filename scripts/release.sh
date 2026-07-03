#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "usage: ./scripts/release.sh <semver>"
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "version must be semver like 0.1.0"
  exit 1
fi

git diff --quiet
git diff --cached --quiet

TAG="v$VERSION"
git tag -a "$TAG" -m "Release $TAG"
echo "Created tag $TAG"
echo "Push with: git push origin main dev $TAG"
