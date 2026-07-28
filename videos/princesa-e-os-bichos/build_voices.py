#!/usr/bin/env python3
"""Generate per-scene dialogue tracks for "A Princesa e o Rio que Parou".

Each character gets a Kokoro base voice plus an ffmpeg pitch shift, so five
distinct voices come out of the three available pt-BR voices. Lines inside a
scene are concatenated with a short beat of silence between them, producing one
wav per scene — the shape assemble-index.mjs expects (one voice clip per frame).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

PROJECT = Path(__file__).parent
VOICE_DIR = PROJECT / "assets" / "voice"
TMP = Path("/tmp/claude-0/-home-user-stunning-octo-tribble/a058df2a-7528-5ce8-bf2b-8d5c118e8bfd/scratchpad/voicegen")
SR = 24000
GAP = 0.30       # beat between two speakers
LEAD = 0.12      # tiny lead-in so a line never starts on frame 0

# character -> (kokoro base voice, pitch multiplier)
CAST = {
    "NARRADOR": ("pm_santa", 1.00),
    "LIA":      ("pf_dora",  1.00),
    "TICO":     ("pf_dora",  1.28),
    "GASPAR":   ("pm_alex",  1.14),
    "BRUNO":    ("pm_santa", 0.80),
}


def parse_script(path: Path):
    """Return [(scene_number, scene_title, [(character, line), ...]), ...]."""
    scenes = []
    current = None
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        m = re.match(r"^##\s*Cena\s*(\d+)\s*—\s*(.+)$", line)
        if m:
            current = (int(m.group(1)), m.group(2).strip(), [])
            scenes.append(current)
            continue
        m = re.match(r"^\*\*([A-ZÁÉÍÓÚÃÕÂÊÔÇ]+):\*\*\s*(.+)$", line)
        if m and current is not None:
            current[2].append((m.group(1), m.group(2).strip()))
    return scenes


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"FAILED: {' '.join(cmd[:6])}...\n{r.stderr[-600:]}", file=sys.stderr)
        raise SystemExit(1)
    return r


def duration(path: Path) -> float:
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)])
    return float(r.stdout.strip())


def synth_line(text: str, character: str, out: Path):
    """TTS one line, then pitch-shift it into this character's timbre."""
    base, pitch = CAST[character]
    raw = out.with_suffix(".raw.wav")
    run(["npx", "hyperframes", "tts", text, "--voice", base,
         "--lang", "pt-br", "-o", str(raw)])
    if abs(pitch - 1.0) < 0.001:
        raw.replace(out)
        return
    # asetrate shifts pitch AND speed; atempo=1/pitch restores the original pace
    # so a squeaky voice doesn't also become a fast one.
    af = f"asetrate={SR}*{pitch},aresample={SR},atempo={1.0/pitch:.6f}"
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af, str(out)])
    raw.unlink(missing_ok=True)


def silence(seconds: float, out: Path):
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
         "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{seconds}", str(out)])


def main():
    scenes = parse_script(PROJECT / "SCRIPT.md")
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    lead = TMP / "_lead.wav"
    gap = TMP / "_gap.wav"
    silence(LEAD, lead)
    silence(GAP, gap)

    voices, cues = [], []
    for number, title, lines in scenes:
        pieces = [lead]
        scene_cues = []
        cursor = LEAD
        for idx, (character, text) in enumerate(lines):
            clip = TMP / f"s{number:02d}_{idx}_{character}.wav"
            synth_line(text, character, clip)
            d = duration(clip)
            scene_cues.append({
                "character": character,
                "text": text,
                "start_s": round(cursor, 3),
                "end_s": round(cursor + d, 3),
            })
            cursor += d
            pieces.append(clip)
            if idx != len(lines) - 1:
                pieces.append(gap)
                cursor += GAP

        out = VOICE_DIR / f"{number:02d}.wav"
        listing = TMP / f"concat_{number:02d}.txt"
        listing.write_text("".join(f"file '{p}'\n" for p in pieces), encoding="utf-8")
        run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
             "-i", str(listing), "-c", "copy", str(out)])

        total = duration(out)
        voices.append({
            "frame": number,
            "path": f"assets/voice/{number:02d}.wav",
            "duration_s": round(total, 3),
            "words": [],
        })
        cues.append({"scene": number, "title": title, "lines": scene_cues})
        speakers = " + ".join(dict.fromkeys(c for c, _ in lines))
        print(f"  cena {number:02d} {title[:28]:<28} {total:5.2f}s  [{speakers}]")

    (PROJECT / "audio_meta.json").write_text(
        json.dumps({"bgm": None, "voices": voices, "sfx": []}, indent=2), encoding="utf-8")
    # Per-line cue sheet: the frame workers time each character's mouth flap and
    # speech bubble against these windows.
    (PROJECT / "dialogue_cues.json").write_text(
        json.dumps(cues, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\ntotal: {sum(v['duration_s'] for v in voices):.1f}s across {len(voices)} scenes")


if __name__ == "__main__":
    main()
