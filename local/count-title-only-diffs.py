#!/usr/bin/env python3
"""List files in git range where the only change vs base is frontmatter `title`."""
from __future__ import annotations

import re
import subprocess
import sys
from typing import Any

import yaml

# First YAML frontmatter block at file start (Starlight MDX convention).
FRONTMATTER = re.compile(r"^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n", re.MULTILINE)


def git_show(ref_path: str) -> str | None:
    p = subprocess.run(
        ["git", "show", ref_path],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if p.returncode != 0:
        return None
    return p.stdout


def split_frontmatter(content: str) -> tuple[str, str] | None:
    m = FRONTMATTER.match(content)
    if not m:
        return None
    fm = m.group(1)
    body = content[m.end() :]
    return fm, body


def fm_dict(fm_yaml: str) -> dict[str, Any] | None:
    try:
        data = yaml.safe_load(fm_yaml)
    except yaml.YAMLError:
        return None
    if data is None:
        return {}
    if not isinstance(data, dict):
        return None
    return data


def dict_without_title(d: dict[str, Any]) -> dict[str, Any]:
    out = {k: v for k, v in d.items() if k != "title"}
    return out


def titles_differ(a: dict[str, Any], b: dict[str, Any]) -> bool:
    return a.get("title") != b.get("title")


def main() -> int:
    base = "@{u}"
    r = subprocess.run(
        ["git", "rev-parse", base],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if r.returncode != 0:
        print("No upstream ref @{u}; set branch tracking first.", file=sys.stderr)
        return 1
    merge_range = f"{base}..HEAD"

    names = subprocess.check_output(
        ["git", "diff", "--name-only", merge_range],
        text=True,
        encoding="utf-8",
        errors="replace",
    ).splitlines()

    eligible: list[str] = []
    skipped: dict[str, int] = {
        "identical_parse": 0,
        "no_frontmatter": 0,
        "missing_base": 0,
        "missing_head": 0,
        "yaml_error": 0,
        "body_diff": 0,
        "non_title_fm_diff": 0,
        "title_unchanged": 0,
    }

    for path in names:
        base_content = git_show(f"{base}:{path}")
        head_content = git_show(f"HEAD:{path}")
        if base_content is None and head_content is None:
            continue
        if base_content is None:
            skipped["missing_base"] += 1
            continue
        if head_content is None:
            skipped["missing_head"] += 1
            continue
        if base_content == head_content:
            continue

        sp_base = split_frontmatter(base_content)
        sp_head = split_frontmatter(head_content)
        if sp_base is None or sp_head is None:
            skipped["no_frontmatter"] += 1
            continue

        fm_b, body_b = sp_base
        fm_h, body_h = sp_head
        if body_b != body_h:
            skipped["body_diff"] += 1
            continue

        db = fm_dict(fm_b)
        dh = fm_dict(fm_h)
        if db is None or dh is None:
            skipped["yaml_error"] += 1
            continue

        if dict_without_title(db) != dict_without_title(dh):
            skipped["non_title_fm_diff"] += 1
            continue

        if not titles_differ(db, dh):
            skipped["title_unchanged"] += 1
            continue

        eligible.append(path)

    print(f"Range: {merge_range}")
    print(f"Total paths changed in range: {len(names)}")
    print(f"Eligible (only frontmatter title differs): {len(eligible)}")
    print()
    print("Skip reasons (files not eligible):")
    for k, v in sorted(skipped.items(), key=lambda x: -x[1]):
        if v:
            print(f"  {k}: {v}")
    print()
    for p in eligible:
        print(p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
