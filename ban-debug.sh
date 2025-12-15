#!/usr/bin/env bash
set -euo pipefail

echo "Running debug-print ban check..."

if grep -R -n -E "console\.log|console\.debug|puts|print|printf" . \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.py' --include='*.rb' --include='*.go' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=coverage --exclude-dir=dist --exclude=ban-debug.sh; then
  echo "❌ Debug-style printing detected. Remove console/print usage."
  exit 1
fi

echo "✅ No disallowed debug prints found."

