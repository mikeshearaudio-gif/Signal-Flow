#!/usr/bin/env python3

from pathlib import Path
import csv
import json
import re

ROOT = Path.cwd()
AUDIT = ROOT / "audit"
LEVELS_JSON = AUDIT / "live-sound-canonical-levels.json"

BOARD_CSV = AUDIT / "live-sound-board-equipment-jack-manifest.csv"
ASSET_CSV = AUDIT / "live-sound-asset-needs.csv"
BUILD_MD = AUDIT / "live-sound-board-build-order.md"


def slug(text):
    s = text.lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def is_stage_source(label):
    l = label.lower()
    return "mic" in l or "microphone" in l or "di" in l


def is_console_output(label):
    l = label.lower()
    return any(x in l for x in [
        "main ",
        "aux ",
        "matrix ",
        "broadcast split",
        "talkback output",
    ])


def equipment_for_label(label):
    l = label.lower()
    eq = set()

    if is_stage_source(label):
        eq.add("Stage source stack")

    if "stage box input" in l:
        eq.add("16-channel stagebox")

    if is_console_output(label):
        eq.add("FOH console I/O")

    if "system processor" in l:
        eq.add("System processor / crossover")

    if "main pa" in l:
        eq.add("Main PA amplifier")

    if "iem tx" in l:
        eq.add("IEM transmitter")

    if "in-ear" in l:
        eq.add("In-Ear Monitoring rack")

    if "vocal wedge" in l:
        eq.add("Vocal wedge monitor")

    if "front fill" in l:
        eq.add("Front-fill processor")

    if "sub" in l:
        eq.add("Sub processor / crossover input")

    if "delay" in l:
        eq.add("Delay tower processing")

    if "record out" in l or "broadcast split" in l:
        eq.add("Broadcast / recorder I/O")

    return eq


def generated_jacks_for_equipment(eq):
    mapping = {
        "Stage source stack": [
            "Lead Vocal Mic",
            "Keys L DI",
            "Keys R DI",
            "Talkback Mic",
        ],
        "16-channel stagebox": [
            f"Stage Box Input {n}" for n in range(1, 17)
        ],
        "FOH console I/O": [
            "Main L Output",
            "Main R Output",
            "FOH Aux 1 Output",
            "FOH Aux 2 Output",
            "FOH Aux 3 Output",
            "FOH Aux 5 L Output",
            "FOH Aux 5 R Output",
            "Matrix 1 Output",
            "Matrix 2 Output",
            "Matrix 3 Output",
            "Broadcast Split L",
            "Broadcast Split R",
            "Talkback Output",
        ],
        "System processor / crossover": [
            "System Processor L In",
            "System Processor R In",
            "System Processor L Out",
            "System Processor R Out",
            "Sub Input",
        ],
        "Main PA amplifier": [
            "Main PA L Input",
            "Main PA R Input",
        ],
        "IEM transmitter": [
            "IEM TX A Left Input",
            "IEM TX A Right Input",
            "IEM TX B Left Input",
            "IEM TX B Right Input",
        ],
        "In-Ear Monitoring rack": [
            "In-Ear A In",
            "In-Ear B In",
            "In-Ear A Input",
            "In-Ear B Input",
        ],
        "Vocal wedge monitor": [
            "Vocal Wedge Input",
        ],
        "Front-fill processor": [
            "Front Fill Processor Input",
        ],
        "Sub processor / crossover input": [
            "Sub Processor Input",
            "Sub Input",
        ],
        "Delay tower processing": [
            "Delay Tower Processor Input",
            "Delay",
        ],
        "Broadcast / recorder I/O": [
            "Broadcast Split L",
            "Broadcast Split R",
            "Record Out L",
            "Record Out R",
        ],
    }

    return mapping.get(eq, [])


def asset_for_equipment(eq):
    mapping = {
        "Stage source stack": "source-node-ui",
        "16-channel stagebox": "stagebox-16-input-svg",
        "FOH console I/O": "foh-console-io-panel-svg",
        "System processor / crossover": "system-processor-crossover-svg",
        "Main PA amplifier": "main-pa-amplifier-svg",
        "IEM transmitter": "iem-transmitter-svg",
        "In-Ear Monitoring rack": "in-ear-monitoring-rack-svg",
        "Vocal wedge monitor": "vocal-wedge-svg",
        "Front-fill processor": "front-fill-processor-svg",
        "Sub processor / crossover input": "sub-processor-crossover-svg",
        "Delay tower processing": "delay-tower-processing-svg",
        "Broadcast / recorder I/O": "broadcast-recorder-io-svg",
    }

    return mapping.get(eq, "unknown-asset-review")


def route_key(src, dst):
    return f"{slug(src)}-to-{slug(dst)}"


def false_jacks_for_level(equipment, required_jacks):
    false = set()

    if "16-channel stagebox" in equipment:
        used = set()

        for jack in required_jacks:
            m = re.match(r"Stage Box Input (\d+)", jack)
            if m:
                used.add(int(m.group(1)))

        for n in range(1, 17):
            if n not in used:
                false.add(f"Stage Box Input {n} unused false option")

    if "FOH console I/O" in equipment:
        false.update([
            "Wrong aux output",
            "Wrong matrix output",
            "Main output used as unsafe monitor-source trap",
            "Talkback Output used to wrong destination",
        ])

    if "IEM transmitter" in equipment:
        false.update([
            "IEM TX wrong side",
            "IEM TX wrong pack/input",
        ])

    if "In-Ear Monitoring rack" in equipment:
        false.update([
            "In-Ear A In when B is required",
            "In-Ear B In when A is required",
        ])

    if "System processor / crossover" in equipment:
        false.update([
            "Crossed System Processor L/R input",
            "Processor input patched directly to amp input",
        ])

    if "Broadcast / recorder I/O" in equipment:
        false.update([
            "Crossed Record Out L/R",
            "Broadcast mono/crossed feed",
        ])

    return sorted(false)


def main():
    if not LEVELS_JSON.exists():
        raise SystemExit(
            f"Missing {LEVELS_JSON}. Run extract_live_sound_manifest.py first."
        )

    levels = json.loads(LEVELS_JSON.read_text())

    board_rows = []
    asset_map = {}

    for level_id in sorted(levels):
        level = levels[level_id]
        status = level.get("status", "")
        required = level.get("required", [])

        required_sources = set()
        required_jacks = set()
        required_routes = []
        equipment = set()

        for route in required:
            src = route["source"]
            dst = route["destination"]

            required_routes.append(route_key(src, dst))

            if is_stage_source(src):
                required_sources.add(src)
            else:
                required_jacks.add(src)

            required_jacks.add(dst)

            equipment.update(equipment_for_label(src))
            equipment.update(equipment_for_label(dst))

        generated_jacks = set()

        for eq in equipment:
            generated_jacks.update(generated_jacks_for_equipment(eq))
            asset_key = asset_for_equipment(eq)

            if asset_key not in asset_map:
                asset_map[asset_key] = {
                    "asset_key": asset_key,
                    "equipment": eq,
                    "needed_by_levels": set(),
                }

            asset_map[asset_key]["needed_by_levels"].add(level_id)

        board_rows.append({
            "level_id": level_id,
            "status": status,
            "title": level.get("title", ""),
            "required_route_count": len(required),
            "required_routes": "; ".join(required_routes),
            "required_sources": "; ".join(sorted(required_sources)),
            "required_jacks": "; ".join(sorted(required_jacks)),
            "equipment": "; ".join(sorted(equipment)),
            "generated_jacks": "; ".join(sorted(generated_jacks)),
            "false_or_misleading_jacks": "; ".join(
                false_jacks_for_level(equipment, required_jacks)
            ),
            "renderer_notes": (
                "Use normal source-node creation; no boot-time manual DOM source injection."
                if status == "patch-board"
                else "Do not convert to native patch board."
            ),
        })

    with BOARD_CSV.open("w", newline="") as f:
        fieldnames = [
            "level_id",
            "status",
            "title",
            "required_route_count",
            "required_routes",
            "required_sources",
            "required_jacks",
            "equipment",
            "generated_jacks",
            "false_or_misleading_jacks",
            "renderer_notes",
        ]

        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(board_rows)

    asset_rows = []

    for item in asset_map.values():
        asset_rows.append({
            "asset_key": item["asset_key"],
            "equipment": item["equipment"],
            "needed_by_level_count": len(item["needed_by_levels"]),
            "needed_by_levels": "; ".join(sorted(item["needed_by_levels"])),
            "existing_asset_status": "audit-needed",
            "suggested_next_action": "confirm existing asset or create production SVG",
        })

    asset_rows.sort(key=lambda r: (-r["needed_by_level_count"], r["asset_key"]))

    with ASSET_CSV.open("w", newline="") as f:
        fieldnames = [
            "asset_key",
            "equipment",
            "needed_by_level_count",
            "needed_by_levels",
            "existing_asset_status",
            "suggested_next_action",
        ]

        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(asset_rows)

    patch_rows = [r for r in board_rows if r["status"] == "patch-board"]
    non_patch_rows = [r for r in board_rows if r["status"] != "patch-board"]

    patch_rows.sort(key=lambda r: (
        r["required_route_count"],
        "Talkback" in r["title"],
        r["level_id"],
    ))

    md = [
        "# Live Sound Board Build Order",
        "",
        "## Policy",
        "",
        "- Do not convert non-patch levels into native patch boards.",
        "- Build patch boards from the manifest: source nodes, equipment, generated jacks, false jacks, then layout.",
        "- Enforce stereo pair completeness before visual polish.",
        "- No board-specific source may be manually injected after render.",
        "",
        "## Suggested patch-board build order",
        "",
    ]

    for r in patch_rows:
        md.append(
            f"- {r['level_id']} - {r['title']} "
            f"({r['required_route_count']} required routes; equipment: {r['equipment']})"
        )

    md.extend([
        "",
        "## Non-patch / do-not-convert levels",
        "",
    ])

    for r in non_patch_rows:
        md.append(f"- {r['level_id']} - {r['title']}")

    BUILD_MD.write_text("\n".join(md))

    print("Wrote:")
    print(f"  {BOARD_CSV}")
    print(f"  {ASSET_CSV}")
    print(f"  {BUILD_MD}")
    print()
    print(f"Board rows: {len(board_rows)}")
    print(f"Asset needs: {len(asset_rows)}")
    print(f"Patch boards: {len(patch_rows)}")
    print(f"Non-patch levels: {len(non_patch_rows)}")


if __name__ == "__main__":
    main()
