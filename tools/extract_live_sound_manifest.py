#!/usr/bin/env python3
from pathlib import Path
import csv
import json
import re

ROOT = Path.cwd()
HTML_PATH = ROOT / "launch" / "Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"
OUT_DIR = ROOT / "audit"

PATCH_ALLOWLIST = {
    "LIV-002", "LIV-003", "LIV-006", "LIV-007", "LIV-009", "LIV-010",
    "LIV-011", "LIV-012", "LIV-015", "LIV-016", "LIV-018", "LIV-019",
    "LIV-020", "LIV-021", "LIV-023", "LIV-025", "LIV-026", "LIV-028",
    "LIV-029", "LIV-030", "LIV-032", "LIV-033", "LIV-034", "LIV-037",
    "LIV-038", "LIV-039", "LIV-040", "LIV-042", "LIV-043", "LIV-044",
    "LIV-047", "LIV-048", "LIV-049"
}

NON_PATCH_LEVELS = {
    "LIV-001", "LIV-004", "LIV-005", "LIV-008", "LIV-013", "LIV-014",
    "LIV-017", "LIV-022", "LIV-024", "LIV-027", "LIV-031", "LIV-035",
    "LIV-036", "LIV-041", "LIV-045", "LIV-046", "LIV-050"
}

ALL_LIV_001_050 = {f"LIV-{n:03d}" for n in range(1, 51)}


def strip_js_comments(text):
    out = []
    i = 0
    n = len(text)
    in_str = None
    escape = False

    while i < n:
        ch = text[i]
        nxt = text[i + 1] if i + 1 < n else ""

        if in_str:
            out.append(ch)
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            i += 1
            continue

        if ch in ("'", '"', "`"):
            in_str = ch
            out.append(ch)
            i += 1
            continue

        if ch == "/" and nxt == "/":
            while i < n and text[i] not in "\r\n":
                i += 1
            out.append("\n")
            continue

        if ch == "/" and nxt == "*":
            i += 2
            while i + 1 < n and not (text[i] == "*" and text[i + 1] == "/"):
                i += 1
            i += 2
            out.append(" ")
            continue

        out.append(ch)
        i += 1

    return "".join(out)


def match_balanced(text, start, open_char, close_char):
    depth = 0
    in_str = None
    escape = False

    for i in range(start, len(text)):
        ch = text[i]

        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            continue

        if ch in ("'", '"', "`"):
            in_str = ch
            continue

        if ch == open_char:
            depth += 1
        elif ch == close_char:
            depth -= 1
            if depth == 0:
                return i + 1

    return None


def get_field(block, key):
    pattern = re.compile(
        rf'(?:["\']{re.escape(key)}["\']|{re.escape(key)})\s*:\s*(["\'])(.*?)\1',
        re.S
    )
    m = pattern.search(block)
    return clean_string(m.group(2)) if m else ""


def clean_string(s):
    return (
        s.replace("\\'", "'")
         .replace('\\"', '"')
         .replace("\\n", " ")
         .replace("\\u2192", "→")
         .strip()
    )


def get_array_literal(block, key):
    m = re.search(rf'(?:["\']{re.escape(key)}["\']|{re.escape(key)})\s*:', block)
    if not m:
        return ""

    start = block.find("[", m.end())
    if start == -1:
        return ""

    end = match_balanced(block, start, "[", "]")
    if end is None:
        return ""

    return block[start:end]


def parse_required_pairs(block):
    arr = get_array_literal(block, "required")
    if not arr:
        return []

    pair_re = re.compile(
        r'\[\s*(["\'])(.*?)\1\s*,\s*(["\'])(.*?)\3\s*\]',
        re.S
    )

    pairs = []
    for m in pair_re.finditer(arr):
        src = clean_string(m.group(2))
        dst = clean_string(m.group(4))
        if src and dst:
            pairs.append((src, dst))

    return pairs


def slug(label):
    s = label.lower()
    s = s.replace("&", " and ")
    s = s.replace("→", " to ")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def canonical_node_key(label):
    t = label.strip()

    m = re.match(r"Stage Box Input\s+(\d+)", t, re.I)
    if m:
        return f"stagebox-input-{m.group(1)}"

    m = re.match(r"In-Ear\s+([A-Z])\s+(?:Input|In)", t, re.I)
    if m:
        return f"in-ear-{m.group(1).lower()}-in"

    m = re.match(r"IEM TX\s+([A-Z])\s+(Left|Right)\s+Input", t, re.I)
    if m:
        return f"iem-tx-{m.group(1).lower()}-{m.group(2).lower()}-input"

    return slug(t)


def has_stereo_token(label):
    return bool(re.search(r"\b(L|R|Left|Right)\b", label, re.I))


def side_of(label):
    if re.search(r"\b(L|Left)\b", label, re.I):
        return "left"
    if re.search(r"\b(R|Right)\b", label, re.I):
        return "right"
    return ""


def stereo_group_key(src, dst):
    src_norm = re.sub(r"\bLeft\b|\bRight\b|\bL\b|\bR\b", "{SIDE}", src, flags=re.I)
    dst_norm = re.sub(r"\bLeft\b|\bRight\b|\bL\b|\bR\b", "{SIDE}", dst, flags=re.I)

    # Stereo DI into numbered stagebox inputs is valid when L/R sources route
    # to adjacent stagebox inputs, even though the destination labels differ.
    if "{SIDE}" in src_norm and re.match(r"Stage Box Input\s+\d+", dst, re.I):
        return src_norm.strip()

    combo = f"{src_norm} -> {dst_norm}"
    combo = re.sub(r"\s+", " ", combo).strip()
    return combo if "{SIDE}" in combo else ""


def infer_equipment(label):
    l = label.lower()

    if "stage box input" in l:
        return "16-channel stagebox"
    if "iem tx" in l:
        return "IEM transmitter"
    if "in-ear" in l:
        return "In-Ear Monitoring rack"
    if "vocal wedge" in l:
        return "Vocal wedge monitor"
    if "system processor" in l:
        return "System processor / crossover"
    if "sub" in l and "processor" in l:
        return "Sub processor"
    if "sub input" in l:
        return "Sub input / crossover"
    if "front fill" in l:
        return "Front-fill processor"
    if "delay" in l:
        return "Delay tower processing"
    if "record out" in l:
        return "Recorder / broadcast destination"
    if "pa amp" in l or "amplifier" in l:
        return "Main PA amplifier"
    if "main" in l or "aux" in l or "matrix" in l or "talkback output" in l or "broadcast split" in l:
        return "FOH console"
    if "mic" in l or "microphone" in l:
        return "Source microphone"
    if "di" in l:
        return "DI source"

    return "Unknown / needs review"


def generated_jack_family(label):
    l = label.lower()

    if "stage box input" in l:
        return "Stagebox inputs 1-16"
    if "iem tx" in l:
        return "IEM TX A Left Input; IEM TX A Right Input; optional B pair if level uses B"
    if "in-ear" in l:
        return "In-Ear Monitoring inputs A and B"
    if "system processor" in l:
        return "System Processor L In; System Processor R In; processor outputs"
    if "main" in l:
        return "FOH Main L Output; FOH Main R Output"
    if "aux 5" in l:
        return "FOH Aux 5 L Output; FOH Aux 5 R Output"
    if "aux" in l:
        return "FOH Aux outputs used by level"
    if "matrix" in l:
        return "FOH Matrix outputs 1-3 or level-specific matrix set"
    if "broadcast split" in l:
        return "Broadcast Split L; Broadcast Split R"
    if "record out" in l:
        return "Record Out L; Record Out R"
    if "talkback output" in l:
        return "Talkback Output; nearby false FOH outputs"
    if "vocal wedge" in l:
        return "Vocal Wedge Input"
    if "sub" in l:
        return "Sub Input / Sub Processor Input"
    if "delay" in l:
        return "Delay Tower Processor Input / Delay Input"
    if "pa amp" in l or "amplifier" in l:
        return "Main PA Amp Left Input; Main PA Amp Right Input"

    return ""


def false_jacks_for_route(src, dst):
    labels = " ".join([src, dst]).lower()
    false = []

    if "stage box input" in labels:
        false.append("Unused stagebox inputs")
    if "iem" in labels or "in-ear" in labels:
        false.append("Wrong IEM side/input")
        false.append("Main output as unsafe monitor-source trap")
    if "main" in labels or "system processor" in labels:
        false.append("Crossed L/R main/system processor jacks")
    if "matrix" in labels:
        false.append("Wrong matrix output")
    if "aux" in labels:
        false.append("Wrong aux output")
    if "broadcast" in labels or "record" in labels:
        false.append("Crossed broadcast/record L/R jacks")
    if "talkback" in labels:
        false.append("PA mains / front-fill destinations as unsafe talkback traps")

    return "; ".join(dict.fromkeys(false))


def board_status(level_id):
    if level_id in PATCH_ALLOWLIST:
        return "patch-board"
    if level_id in NON_PATCH_LEVELS:
        return "non-patch-do-not-convert"
    return "unknown-review"


def extract_level_blocks(text):
    text = strip_js_comments(text)

    id_re = re.compile(
        r'(?:["\']id["\']|id)\s*:\s*["\'](LIV-\d{3})["\']'
    )

    blocks = []

    for m in id_re.finditer(text):
        level_id = m.group(1)
        if level_id not in ALL_LIV_001_050:
            continue

        start = text.rfind("{", 0, m.start())
        if start == -1:
            continue

        end = match_balanced(text, start, "{", "}")
        if end is None:
            continue

        block = text[start:end]

        # Must look like an actual level object, not a wrapper list.
        if "required" not in block and "training" not in block:
            continue

        blocks.append({
            "level_id": level_id,
            "start": start,
            "end": end,
            "block": block
        })

    # If a level appears multiple times, keep the latest definition in file order.
    latest = {}
    for item in blocks:
        latest[item["level_id"]] = item

    return [latest[k] for k in sorted(latest)]


def main():
    if not HTML_PATH.exists():
        raise SystemExit(f"Missing HTML file: {HTML_PATH}")

    OUT_DIR.mkdir(exist_ok=True)

    text = HTML_PATH.read_text(errors="ignore")
    blocks = extract_level_blocks(text)

    level_rows = []
    route_rows = []
    validation = []
    levels_json = {}

    for item in blocks:
        level_id = item["level_id"]
        block = item["block"]

        title = get_field(block, "title")
        brief = get_field(block, "brief")
        difficulty = get_field(block, "difficulty")
        time = get_field(block, "time")
        training_type = get_field(block, "type")
        pairs = parse_required_pairs(block)

        status = board_status(level_id)

        levels_json[level_id] = {
            "level_id": level_id,
            "status": status,
            "title": title,
            "brief": brief,
            "difficulty": difficulty,
            "time": time,
            "training_type": training_type,
            "required": [{"source": a, "destination": b} for a, b in pairs]
        }

        level_rows.append({
            "level_id": level_id,
            "status": status,
            "title": title,
            "brief": brief,
            "difficulty": difficulty,
            "time": time,
            "training_type": training_type,
            "required_route_count": len(pairs),
            "source_file": str(HTML_PATH.relative_to(ROOT))
        })

        stereo_groups = {}

        for idx, (src, dst) in enumerate(pairs, 1):
            src_key = canonical_node_key(src)
            dst_key = canonical_node_key(dst)
            route_key = f"{src_key}-to-{dst_key}"

            stereo = has_stereo_token(src) or has_stereo_token(dst)
            side = side_of(src) or side_of(dst)
            group = stereo_group_key(src, dst)

            if group:
                stereo_groups.setdefault(group, set()).add(side or "unknown")

            equipment = sorted(dict.fromkeys([
                infer_equipment(src),
                infer_equipment(dst)
            ]))

            generated = sorted(dict.fromkeys([
                generated_jack_family(src),
                generated_jack_family(dst)
            ]))
            generated = [g for g in generated if g]

            route_rows.append({
                "level_id": level_id,
                "status": status,
                "route_index": idx,
                "title": title,
                "source_label": src,
                "destination_label": dst,
                "source_node_key": src_key,
                "destination_node_key": dst_key,
                "route_key": route_key,
                "stereo_route": "yes" if stereo else "no",
                "stereo_side": side,
                "stereo_group": group,
                "equipment_needed": "; ".join(equipment),
                "generated_jack_families": "; ".join(generated),
                "false_or_misleading_jacks": false_jacks_for_route(src, dst),
                "notes": ""
            })

        for group, sides in stereo_groups.items():
            if "left" in sides and "right" not in sides:
                validation.append(f"- {level_id}: stereo group missing RIGHT side: {group}")
            if "right" in sides and "left" not in sides:
                validation.append(f"- {level_id}: stereo group missing LEFT side: {group}")

    missing_levels = sorted(ALL_LIV_001_050 - {r["level_id"] for r in level_rows})
    for level_id in missing_levels:
        validation.append(f"- {level_id}: not found as a parseable level object in active HTML.")

    route_csv = OUT_DIR / "live-sound-canonical-route-manifest.csv"
    level_csv = OUT_DIR / "live-sound-canonical-level-summary.csv"
    json_path = OUT_DIR / "live-sound-canonical-levels.json"
    report_path = OUT_DIR / "live-sound-manifest-validation.md"

    with route_csv.open("w", newline="") as f:
        fieldnames = [
            "level_id", "status", "route_index", "title",
            "source_label", "destination_label",
            "source_node_key", "destination_node_key", "route_key",
            "stereo_route", "stereo_side", "stereo_group",
            "equipment_needed", "generated_jack_families",
            "false_or_misleading_jacks", "notes"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(route_rows)

    with level_csv.open("w", newline="") as f:
        fieldnames = [
            "level_id", "status", "title", "brief",
            "difficulty", "time", "training_type",
            "required_route_count", "source_file"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(level_rows)

    json_path.write_text(json.dumps(levels_json, indent=2, ensure_ascii=False))

    patch_count = sum(1 for r in level_rows if r["status"] == "patch-board")
    non_patch_count = sum(1 for r in level_rows if r["status"] == "non-patch-do-not-convert")

    report = []
    report.append("# Live Sound Manifest Validation\n")
    report.append("")
    report.append(f"- Parsed LIV levels: {len(level_rows)}")
    report.append(f"- Patch-board levels: {patch_count}")
    report.append(f"- Non-patch / do-not-convert levels: {non_patch_count}")
    report.append(f"- Required route rows: {len(route_rows)}")
    report.append("")
    report.append("## Validation notes")
    report.append("")
    if validation:
        report.extend(validation)
    else:
        report.append("- No missing parsed levels or one-sided stereo groups found by this extractor.")
    report.append("")
    report.append("## Next review targets")
    report.append("")
    report.append("- Confirm non-patch levels are not handed to the native patch renderer.")
    report.append("- Confirm all patch boards use normal source-node creation, not boot-time DOM injection.")
    report.append("- Confirm generated jack families are rendered from equipment, not only from required routes.")
    report.append("- Confirm stereo pair rule is enforced for all L/R or Left/Right routes.")

    report_path.write_text("\n".join(report))

    print("Wrote:")
    print(" ", route_csv)
    print(" ", level_csv)
    print(" ", json_path)
    print(" ", report_path)
    print()
    print(f"Parsed LIV levels: {len(level_rows)}")
    print(f"Patch-board levels: {patch_count}")
    print(f"Non-patch levels: {non_patch_count}")
    print(f"Required route rows: {len(route_rows)}")
    print()
    print("Validation preview:")
    if validation:
        for line in validation[:20]:
            print(line)
        if len(validation) > 20:
            print(f"... {len(validation) - 20} more validation notes")
    else:
        print("No validation warnings.")

if __name__ == "__main__":
    main()
