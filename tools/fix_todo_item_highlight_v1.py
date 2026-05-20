from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

targets = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html"),
]

REMOVE_IDS = [
    "sf-brief-todo-attention-runtime-v4",
    "sf-brief-todo-attention-runtime-script-v4",
    "sf-todo-list-overlay-glow-v3",
    "sf-todo-list-overlay-glow-script-v3",
]

NEW_STYLE_ID = "sf-todo-item-highlight-v1"
NEW_SCRIPT_ID = "sf-todo-item-highlight-script-v1"

STYLE = r'''
<style id="sf-todo-item-highlight-v1">
@keyframes sfTodoItemPulseV1 {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(255, 229, 139, .18),
      0 0 10px rgba(255, 220, 116, .12),
      inset 0 0 0 1px rgba(255, 255, 255, .04);
  }
  50% {
    box-shadow:
      0 0 0 2px rgba(255, 236, 162, .50),
      0 0 18px rgba(255, 220, 116, .28),
      inset 0 0 18px rgba(255, 220, 116, .10);
  }
}

@keyframes sfTodoItemRailV1 {
  0%, 100% { opacity: .38; transform: scaleY(.86); }
  50% { opacity: .95; transform: scaleY(1); }
}

/* Kill the old fixed/broad overlay if any stale copy survives. */
#sf-todo-list-glow-overlay-v3,
.sf-todo-list-glow-overlay-v3 {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Remove old broad attention styling unless an element is also a real item target. */
.sf-brief-todo-attention:not(.sf-todo-item-attention-v1) {
  animation: none !important;
  outline: none !important;
  box-shadow: inherit !important;
}

/* New behavior: item-level only. */
.sf-todo-item-attention-v1 {
  position: relative !important;
  border-color: rgba(255, 228, 137, .42) !important;
  animation: sfTodoItemPulseV1 1.45s ease-in-out infinite !important;
}

.sf-todo-item-attention-v1::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 8px;
  bottom: 8px;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,238,162,.25), rgba(255,202,86,.92), rgba(255,238,162,.25));
  box-shadow: 0 0 12px rgba(255, 216, 107, .55);
  animation: sfTodoItemRailV1 1.2s ease-in-out infinite;
  pointer-events: none;
}

.sf-todo-item-attention-v1.done,
.sf-todo-item-attention-v1:has(.done-badge),
.sf-todo-item-attention-v1.sf-todo-item-complete-v1 {
  animation: none !important;
  box-shadow: none !important;
}

.sf-todo-item-attention-v1.done::before,
.sf-todo-item-attention-v1:has(.done-badge)::before,
.sf-todo-item-attention-v1.sf-todo-item-complete-v1::before {
  display: none !important;
}
</style>
'''

SCRIPT = r'''
<script id="sf-todo-item-highlight-script-v1">
(function(){
  "use strict";

  const VERSION = "v1";
  const ATTENTION = "sf-todo-item-attention-v1";
  const COMPLETE = "sf-todo-item-complete-v1";

  function qsa(sel, root = document) {
    try { return Array.from(root.querySelectorAll(sel)); }
    catch (_) { return []; }
  }

  function visible(el) {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== "none" &&
      cs.visibility !== "hidden" &&
      r.width > 80 &&
      r.height > 18;
  }

  function text(el) {
    return String(el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function lockedOrNonTodoContext(el) {
    return Boolean(el.closest([
      ".sf-build-room-v6r227",
      "[data-training-panel='build-room']",
      "[data-training-panel='diagnose']",
      ".sfdiag-generic-panel",
      ".sfv14104-ir-board",
      ".sfv14105-ir-board",
      ".sfv14106-ir-level",
      ".quiz-panel",
      ".diagnose-panel"
    ].join(",")));
  }

  function isComplete(row) {
    if (!row) return false;
    if (row.classList.contains("done")) return true;
    if (row.querySelector(".done-badge")) return true;
    const badge = row.querySelector(".todo-badge");
    if (!badge) return true;
    const rowText = text(row).toLowerCase();
    return /\bcomplete\b|\bdone\b/.test(rowText) && !/\bto\s*do\b|\btodo\b/.test(rowText);
  }

  function checklistRows(doc = document) {
    const rows = [];

    // Current normal patch/checklist rows.
    qsa(".path-card", doc).forEach(row => {
      if (row.querySelector(".todo-badge")) rows.push(row);
    });

    // Fallbacks for future/checklist variants.
    qsa("[data-todo-item], [data-checklist-item], li", doc).forEach(row => {
      if (row.querySelector(".todo-badge, .done-badge") || /\b(to\s*do|todo|complete)\b/i.test(text(row))) {
        rows.push(row);
      }
    });

    // Deduplicate and require a visible, actual to-do badge.
    return Array.from(new Set(rows)).filter(row => {
      if (!visible(row)) return false;
      if (lockedOrNonTodoContext(row)) return false;
      if (!row.querySelector(".todo-badge")) return false;
      return true;
    });
  }

  function cleanup(doc = document) {
    qsa("#sf-todo-list-glow-overlay-v3, .sf-todo-list-glow-overlay-v3", doc).forEach(el => el.remove());

    qsa(".sf-brief-todo-attention", doc).forEach(el => {
      if (!el.classList.contains(ATTENTION)) el.classList.remove("sf-brief-todo-attention");
    });

    qsa("." + ATTENTION, doc).forEach(el => {
      el.classList.remove(ATTENTION, COMPLETE);
    });
  }

  function apply(doc = document) {
    cleanup(doc);

    const rows = checklistRows(doc);
    if (!rows.length) return;

    rows.forEach(row => {
      if (isComplete(row)) {
        row.classList.add(COMPLETE);
        return;
      }
      row.classList.add(ATTENTION);
    });
  }

  let timer = null;
  function schedule(delay = 80) {
    clearTimeout(timer);
    timer = setTimeout(() => apply(document), delay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(40));
  } else {
    schedule(40);
  }

  window.addEventListener("load", () => {
    schedule(80);
    setTimeout(() => apply(document), 300);
  });
  window.addEventListener("hashchange", () => schedule(120));
  window.addEventListener("popstate", () => schedule(120));

  document.addEventListener("change", () => schedule(120), true);
  document.addEventListener("click", () => schedule(140), true);
  document.addEventListener("pointerup", () => schedule(160), true);
  document.addEventListener("drop", () => schedule(160), true);

  // Class-only observer: no DOM moving, no shell hiding.
  new MutationObserver(() => schedule(90)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "data-level-id", "data-training-panel"]
  });

  window.SignalFlowTodoItemHighlight = { VERSION, apply, cleanup };
  console.log("[Signal Flow] To-do item highlight installed", VERSION);
})();
</script>
'''

def backup(path):
    b = path.with_name(path.name + f".bak_todo_item_highlight_v1_{stamp}")
    shutil.copy2(path, b)
    print("[OK] backup", b)

def remove_block_by_id(html, tag, id_):
    # Matches <style id="...">...</style> or <script id="...">...</script>
    pat = re.compile(
        rf'\s*<{tag}\b(?=[^>]*\bid=["\']{re.escape(id_)}["\'])[^>]*>.*?</{tag}>\s*',
        re.S | re.I
    )
    return pat.sub("\n", html)

for p in targets:
    if not p.exists():
        print("[SKIP] missing", p)
        continue

    backup(p)
    s = p.read_text()
    before = s

    for id_ in REMOVE_IDS:
        s = remove_block_by_id(s, "style", id_)
        s = remove_block_by_id(s, "script", id_)

    # Remove any previous copy of the new patch before reinserting.
    s = remove_block_by_id(s, "style", NEW_STYLE_ID)
    s = remove_block_by_id(s, "script", NEW_SCRIPT_ID)

    if "</head>" in s:
        s = s.replace("</head>", STYLE + "\n</head>", 1)
    else:
        s = STYLE + "\n" + s

    if "</body>" in s:
        s = s.replace("</body>", SCRIPT + "\n</body>", 1)
    else:
        s = s + "\n" + SCRIPT

    p.write_text(s)

    removed = before != s
    print("[OK] patched", p, "changed=", removed)

print("\nTo-do item highlight v1 patch complete.")
