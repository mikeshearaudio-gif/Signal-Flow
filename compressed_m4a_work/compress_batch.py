import math
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ORIGINALS = ROOT / "originals"
OUT = ROOT / "compressed"
FFMPEG = ROOT / "pydeps" / "imageio_ffmpeg" / "binaries" / "ffmpeg-macos-aarch64-v7.1"
TARGET_BYTES = 7_700_000
LIMIT_BYTES = 8_000_000


def duration_seconds(path: Path) -> float:
    proc = subprocess.run(
        [str(FFMPEG), "-hide_banner", "-i", str(path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    match = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", proc.stderr)
    if not match:
        raise RuntimeError(f"Could not read duration for {path.name}")
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def encode(source: Path, dest: Path, bitrate: int) -> None:
    subprocess.run(
        [
            str(FFMPEG),
            "-hide_banner",
            "-y",
            "-i",
            str(source),
            "-vn",
            "-ac",
            "2",
            "-ar",
            "48000",
            "-c:a",
            "aac",
            "-b:a",
            str(bitrate),
            "-movflags",
            "+faststart",
            str(dest),
        ],
        check=True,
    )


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(ORIGINALS.glob("*.m4a"))
    if not files:
        print("No .m4a files found", file=sys.stderr)
        return 1

    rows = []
    for source in files:
        dur = duration_seconds(source)
        bitrate = max(64_000, int(math.floor((TARGET_BYTES * 8 / dur) / 1000) * 1000))
        dest = OUT / source.name
        while True:
            print(f"{source.name}: {dur:.2f}s -> {bitrate // 1000} kbps")
            encode(source, dest, bitrate)
            size = dest.stat().st_size
            if size < LIMIT_BYTES:
                rows.append((source.name, source.stat().st_size, size, bitrate))
                break
            bitrate = int(bitrate * 0.94 // 1000 * 1000)
            if bitrate < 48_000:
                raise RuntimeError(f"Could not fit {source.name} under {LIMIT_BYTES} bytes")

    print("\nname\toriginal_bytes\tcompressed_bytes\tbitrate")
    for name, original, compressed, bitrate in rows:
        print(f"{name}\t{original}\t{compressed}\t{bitrate}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
