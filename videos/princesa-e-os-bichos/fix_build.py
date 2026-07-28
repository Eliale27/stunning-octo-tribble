#!/usr/bin/env python3
"""Post-build normalizer for the princess project.

The render machine has no network access and the assembler re-stamps a CDN
GSAP tag with a subresource-integrity hash on every run. That hash never
matches a locally vendored file, so the browser blocks the script, no timeline
registers, and scenes render as blank frames. This pass repairs that plus the
other issues that only surface once every scene exists.

Idempotent — safe to re-run after each assemble.
"""
import json
import re
import sys
from pathlib import Path

PROJECT = Path(__file__).parent
FRAMES = PROJECT / "compositions" / "frames"
CDN = re.compile(r'<script\s+src="https?://[^"]*gsap[^"]*"[^>]*>\s*</script>', re.I)
LOCAL = '<script src="assets/vendor/gsap.min.js"></script>'

problems, fixes = [], []


def fix_html(path: Path, is_index: bool):
    s = original = path.read_text(encoding="utf-8")
    name = path.name

    # 1. any CDN gsap -> the vendored copy (also drops the stale integrity attr)
    if CDN.search(s):
        s = CDN.sub(LOCAL, s)
        fixes.append(f"{name}: gsap -> local")
    # 2. integrity/crossorigin on the local tag blocks it outright
    s = re.sub(r'(<script src="assets/vendor/gsap\.min\.js")[^>]*(>)', r'\1\2', s)

    # 3. font paths must be root-relative, not composition-relative
    if "../../assets/" in s:
        s = s.replace('../../assets/', 'assets/')
        fixes.append(f"{name}: font/asset paths -> root-relative")

    # 4. remaining network references are fatal on the render box
    for host in ("googleapis", "gstatic", "jsdelivr", "cdnjs", "unpkg"):
        if host in s:
            problems.append(f"{name}: still references {host}")

    if not is_index:
        # 5. data-composition-id belongs on #root only, never on <template>
        s = re.sub(r'<template\s+data-composition-id="[^"]*"\s*>', '<template>', s)

        # 6. duplicate track indices on overlapping clips break assembly
        tracks = re.findall(r'data-track-index="(\d+)"', s)
        if len(tracks) != len(set(tracks)):
            for i, _ in enumerate(tracks):
                s = re.sub(r'data-track-index="\d+"',
                           lambda m, c=[0]: f'data-track-index="{c.append(0) or len(c) - 1}"',
                           s, count=1) if False else s
            # rewrite sequentially in document order
            counter = iter(range(len(tracks)))
            s = re.sub(r'data-track-index="\d+"',
                       lambda m: f'data-track-index="{next(counter)}"', s)
            fixes.append(f"{name}: renumbered {len(tracks)} track indices (had duplicates)")

        # 7. non-deterministic constructs the frame-by-frame renderer cannot seek
        for bad in ("Math.random", "Date.now", "repeat: -1", "repeat:-1"):
            if bad in s:
                problems.append(f"{name}: contains {bad}")

        # 8. a root tag split across lines defeats the transition injector's parser
        m = re.search(r'<div id="root"[^>]*>', s, re.S)
        if m and "\n" in m.group(0):
            s = s[:m.start()] + re.sub(r'\s+', ' ', m.group(0)).strip() + s[m.end():]
            fixes.append(f"{name}: collapsed multiline root tag")

        if 'data-composition-id' not in s:
            problems.append(f"{name}: no data-composition-id on root")

    if s != original:
        path.write_text(s, encoding="utf-8")


def main():
    index = PROJECT / "index.html"
    if index.exists():
        fix_html(index, is_index=True)
    for f in sorted(FRAMES.glob("*.html")):
        fix_html(f, is_index=False)

    for f in fixes:
        print(f"  fixed  {f}")
    for p in problems:
        print(f"  !!     {p}")
    print(f"\n{len(fixes)} fix(es), {len(problems)} unresolved")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
