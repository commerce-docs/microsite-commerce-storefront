#!/usr/bin/env bash
# Create a zip of the write-edit-docs command, skill, and manifest-listed dependencies
# (full skill directories, rule files, JSON catalogs, and the documentation-workflow hub).
# Requires jq. Paths are driven by .cursor/documentation-workflow/manifest.json.
#
# Usage:
#   ./scripts/zip-write-edit-docs.sh
#   ./scripts/zip-write-edit-docs.sh /path/to/out.zip
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
M="${REPO_ROOT}/.cursor/documentation-workflow/manifest.json"
OUT="${1:-${REPO_ROOT}/write-edit-docs-workflow.zip}"

if ! command -v jq &>/dev/null; then
  echo "This script needs jq. Install it (for example: brew install jq) and try again." >&2
  exit 1
fi

if [[ ! -f "$M" ]]; then
  echo "Manifest not found: $M" >&2
  exit 1
fi

cd "$REPO_ROOT"
rm -f "$OUT"

zip -q -r "$OUT" \
  .cursor/documentation-workflow \
  .cursor/commands/write-edit-docs.mdc \
  .cursor/rules/doc-skills-orchestrator.mdc \
  .cursor/data/code-sources.json \
  .cursor/data/documentation-sources.json

while IFS= read -r f; do
  [[ -e "$f" ]] || { echo "Missing: $f" >&2; exit 1; }
  zip -q "$OUT" "$f"
done < <(jq -r '.rules[]' "$M")

while IFS= read -r d; do
  [[ -d "$d" ]] || { echo "Missing directory: $d" >&2; exit 1; }
  zip -q -r "$OUT" "$d"
done < <(jq -r '.skills[]' "$M" | xargs -n1 dirname | sort -u)

echo "Wrote: $OUT ($(du -h "$OUT" | cut -f1))"
