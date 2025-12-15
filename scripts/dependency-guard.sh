#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_SHA:-}"

if [ -z "$BASE" ]; then
  BASE="$(git rev-parse HEAD~1)"
fi

FILES=$(git diff --name-only "$BASE"...HEAD -- package.json backend/package.json frontend/package.json go.mod Gemfile Pipfile 2>/dev/null || true)

if [ -z "$FILES" ]; then
  echo "No dependency manifests changed."
  exit 0
fi

echo "Checking for dependency additions against $BASE..."

if git diff --no-ext-diff "$BASE"...HEAD -- $FILES | grep -E '^\+\s*"[^"]+"\s*:\s*"[0-9A-Za-z\.\-\^~]+'; then
  echo "❌ Dependency additions detected. Obtain approvals and document justification."
  exit 1
fi

echo "✅ No dependency additions detected."

