#!/usr/bin/env bash
set -euo pipefail

echo "Running try/catch ban check..."

if grep -R -n -E "^\s*try\s*\{|^\s*catch\s*\(|^\s*rescue\s+" . \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.py' --include='*.rb' --include='*.go' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=coverage --exclude-dir=dist --exclude=ban-try.sh; then
  echo "❌ Local try/catch/rescue detected. Use global handlers or service-level error adapters."
  exit 1
fi

echo "✅ No disallowed try/catch/rescue patterns found."

