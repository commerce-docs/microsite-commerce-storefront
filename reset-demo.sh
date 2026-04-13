#!/usr/bin/env bash
# Reset storefront docs after a March 2026 (or other demo) release-notes demo.
# - Removes the demo suite section from releases/index.mdx (default: ## March 2026 suite … before next ##).
# - Removes all <ChangelogEntry> blocks whose date attribute is in the demo month (default: 2026-03).
# - Deletes gitignored demo scratch files (test-index.mdx, test-changelog.mdx) if present.
# - Normalizes changelog.mdx for MDX: splits glued </ChangelogEntry><ChangelogEntry> onto two lines
#   and collapses legacy multiline {/** … **Title** … */} section markers to single-line {/* Title */}.
#   (Astro MDX treats ** on its own line inside { … } as markdown and can throw "lazy line" errors.)
#
# Does NOT read, write, or delete: .cursor/ (including .cursor/skills/release-notes/SKILL.md),
#   .env*, .temp-repos/, node_modules/, dist/, .astro/
# Does NOT run git (no checkout, reset, or restore) — nothing in this script can revert SKILL.md
#   or other files outside the paths listed above.
#
# Usage (from repo root):
#   pnpm run demo:reset
#   pnpm run demo:reset:dry
#   ./reset-demo.sh
#   DEMO_SUITE_LABEL="March 2026" DEMO_DATE_PREFIX="2026-03" ./reset-demo.sh
#   ./reset-demo.sh --dry-run

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

# Demo identifiers (override with env when you run a different month demo)
DEMO_SUITE_LABEL="${DEMO_SUITE_LABEL:-March 2026}"
DEMO_DATE_PREFIX="${DEMO_DATE_PREFIX:-2026-03}"
# The H2 that immediately follows the demo suite in index.mdx today (used as split anchor)
NEXT_SUITE_HEADING="${NEXT_SUITE_HEADING:-## February 2026 suite}"

INDEX="$ROOT/src/content/docs/releases/index.mdx"
CHANGELOG="$ROOT/src/content/docs/releases/changelog.mdx"
TEST_INDEX="$ROOT/src/content/docs/releases/test-index.mdx"
TEST_CHANGELOG="$ROOT/src/content/docs/releases/test-changelog.mdx"

log() { printf '%s\n' "$*"; }

run_python() {
  python3 - "$@" <<'PY'
import os, re, sys

dry = os.environ.get("DRY_RUN") == "1"
index_path = os.environ["INDEX_PATH"]
changelog_path = os.environ["CHANGELOG_PATH"]
suite_label = os.environ["DEMO_SUITE_LABEL"]
date_prefix = os.environ["DEMO_DATE_PREFIX"]

suite_heading = f"## {suite_label} suite"
next_heading = os.environ.get("NEXT_SUITE_HEADING", "## February 2026 suite")


def strip_demo_suite_index(text: str):
    if suite_heading not in text:
        return text, False
    if next_heading not in text:
        print(
            f"error: found {suite_heading!r} but not {next_heading!r}; "
            "refuse to edit index (unexpected structure). Set NEXT_SUITE_HEADING if the file changed.",
            file=sys.stderr,
        )
        sys.exit(1)
    parts = text.split(next_heading, 1)
    if len(parts) != 2:
        print("error: could not split index on next suite heading.", file=sys.stderr)
        sys.exit(1)
    before_feb, rest = parts[0], parts[1]
    idx = before_feb.find(suite_heading)
    if idx < 0:
        return text, False
    prefix = before_feb[:idx].rstrip() + "\n\n"
    new_text = prefix + next_heading + rest
    return new_text, True


def strip_demo_changelog_entries(text: str):
    date_re = re.compile(
        r'^\s*date="' + re.escape(date_prefix) + r'[^"]*"\s*$',
        re.MULTILINE,
    )

    def is_demo_block(block: str) -> bool:
        return bool(date_re.search(block))

    marker = "<ChangelogEntry"
    close_tag = "</ChangelogEntry>"
    out = []
    pos = 0
    removed = 0
    while pos < len(text):
        start = text.find(marker, pos)
        if start < 0:
            out.append(text[pos:])
            break
        out.append(text[pos:start])
        end = text.find(close_tag, start)
        if end < 0:
            print("error: unclosed ChangelogEntry in changelog.mdx", file=sys.stderr)
            sys.exit(1)
        end += len(close_tag)
        block = text[start:end]
        if is_demo_block(block):
            removed += 1
            pos = end
            # Collapse whitespace after a removed entry so we do not leave huge gaps.
            while pos < len(text) and text[pos] in "\n\r \t":
                pos += 1
        else:
            out.append(block)
            # Do not consume newlines/indent after </ChangelogEntry>; that would merge
            # entries and change the file even when nothing was removed (MDX layout).
            pos = end
    return "".join(out), removed


def normalize_changelog_mdx(text: str) -> str:
    """Keep changelog.mdx compatible with @astrojs/mdx after edits (idempotent)."""
    # 1) Never glue adjacent entries on one line — MDX can fail with "lazy line in container".
    text = text.replace("</ChangelogEntry><ChangelogEntry", "</ChangelogEntry>\n    <ChangelogEntry")

    # 2) Collapse legacy three-line section banners: middle line **Name** breaks MDX inside { … }.
    pat_after_entry = re.compile(
        r"</ChangelogEntry>\{/\*+\s*\n\*\*(.+?)\*\*\s*\n\*+\*/\}",
        re.MULTILINE | re.DOTALL,
    )
    text = pat_after_entry.sub(
        lambda m: "</ChangelogEntry>\n    {/* "
        + re.sub(r"\s+", " ", m.group(1).strip())
        + " */}",
        text,
    )

    pat_after_div = re.compile(
        r'(<div class="changelog-entries">\s*\n)\{/\*+\s*\n\*\*(.+?)\*\*\s*\n\*+\*/\}',
        re.MULTILINE | re.DOTALL,
    )
    text = pat_after_div.sub(
        lambda m: m.group(1)
        + "{/* "
        + re.sub(r"\s+", " ", m.group(2).strip())
        + " */}",
        text,
    )

    pat_standalone = re.compile(
        r"^    \{/\*+\s*\n\*\*(.+?)\*\*\s*\n\*+\*/\}",
        re.MULTILINE | re.DOTALL,
    )
    text = pat_standalone.sub(
        lambda m: "    {/* " + re.sub(r"\s+", " ", m.group(1).strip()) + " */}",
        text,
    )

    return text


def write_if_changed(path: str, new_content: str, dry: bool) -> bool:
    old = open(path, "r", encoding="utf-8").read()
    if old == new_content:
        return False
    if dry:
        log(f"[dry-run] would update {path}")
        return True
    open(path, "w", encoding="utf-8", newline="\n").write(new_content)
    log(f"updated {path}")
    return True


def log(msg: str) -> None:
    print(msg)


if not os.path.isfile(index_path):
    print(f"error: missing {index_path}", file=sys.stderr)
    sys.exit(1)
if not os.path.isfile(changelog_path):
    print(f"error: missing {changelog_path}", file=sys.stderr)
    sys.exit(1)

index_text = open(index_path, "r", encoding="utf-8").read()
new_index, did_strip = strip_demo_suite_index(index_text)
if did_strip:
    write_if_changed(index_path, new_index, dry)
else:
    log(f"no section {suite_heading!r} in index; left index unchanged")

cl_text = open(changelog_path, "r", encoding="utf-8").read()
new_cl, changelog_removed = strip_demo_changelog_entries(cl_text)
new_cl = normalize_changelog_mdx(new_cl)
if new_cl != cl_text:
    write_if_changed(changelog_path, new_cl, dry)
    if changelog_removed:
        log(
            f"changelog: removed {changelog_removed} demo <ChangelogEntry> block(s) and applied MDX normalization"
        )
    else:
        log(
            "changelog: no demo entries removed; applied MDX normalization (glued tags / section comments)"
        )
else:
    if changelog_removed:
        log(
            "warning: strip removed entries but normalize produced same text as input; unexpected"
        )
    else:
        log(
            f'no <ChangelogEntry> with date="{date_prefix}*" in changelog; file already normalized'
        )

log(
    f"summary: index_suite_removed={did_strip} changelog_entries_removed={changelog_removed}"
)
PY
}

export INDEX_PATH="$INDEX"
export CHANGELOG_PATH="$CHANGELOG"
export DEMO_SUITE_LABEL="$DEMO_SUITE_LABEL"
export DEMO_DATE_PREFIX="$DEMO_DATE_PREFIX"
export NEXT_SUITE_HEADING="$NEXT_SUITE_HEADING"
export DRY_RUN="$DRY_RUN"

run_python

remove_if_exists() {
  local f="$1"
  if [[ -f "$f" ]]; then
    if [[ "$DRY_RUN" -eq 1 ]]; then
      log "[dry-run] would remove $f"
    else
      rm -f "$f"
      log "removed $f"
    fi
  fi
}

remove_if_exists "$TEST_INDEX"
remove_if_exists "$TEST_CHANGELOG"

log "reset-demo: done (repo root: $ROOT)"
