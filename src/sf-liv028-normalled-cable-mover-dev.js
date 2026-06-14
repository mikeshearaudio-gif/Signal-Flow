/* Signal Flow LIV-028 normalled cable mover. DEV ONLY. */
(function () {
  "use strict";

  const VERSION = "sf-liv028-normalled-cable-mover-dev-v1";

  function cfg() {
    return window.sfLiveDevToolConfig || {};
  }

  function px(el, prop) {
    const raw = el.style.getPropertyValue(prop) || el.style[prop] || "0";
    const n = parseFloat(String(raw).replace("px", ""));
    return Number.isFinite(n) ? n : 0;
  }

  function setImportant(el, prop, value) {
    el.style.setProperty(prop, String(value), "important");
  }

  function selected(cables, selectedIndex) {
    return cables[selectedIndex] || cables[0] || null;
  }

  function install() {
    const c = cfg();
    if (!c.enabled || c.levelId !== "LIV-028") return false;

    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-028");
    if (!layer) return false;

    const cables = Array.from(layer.querySelectorAll(".sf-liv028-normalled-cable"));
    if (!cables.length) {
      console.warn("[Signal Flow] LIV-028 Cable Mover found no normalled cable targets.");
      return false;
    }

    let selectedIndex = 0;
    let step = 5;

    cables.forEach((el, i) => {
      el.dataset.sfLiv028CableIndex = String(i);
      el.dataset.sfLiv028CableKey = el.dataset.liv028NormalledCableKey || ("cable-" + (i + 1));
      setImportant(el, "pointer-events", "auto");
      setImportant(el, "cursor", "crosshair");
    });

    const panel = document.createElement("div");
    panel.id = "sf-liv028-cable-mover-dev";
    panel.style.cssText = [
      "position:fixed",
      "right:14px",
      "bottom:14px",
      "z-index:2147483647",
      "width:280px",
      "background:rgba(5,12,13,.94)",
      "color:#ffe66c",
      "border:1px solid rgba(255,230,108,.45)",
      "border-radius:10px",
      "padding:10px",
      "font:12px system-ui,-apple-system,Segoe UI,sans-serif",
      "box-shadow:0 10px 30px rgba(0,0,0,.45)"
    ].join(";");

    panel.innerHTML = `
      <div style="font-weight:900;margin-bottom:6px;">LIV-028 Cable Mover</div>
      <div id="sf-liv028-cable-selected" style="margin-bottom:6px;"></div>
      <div><b>[</b> previous cable &nbsp; <b>]</b> next cable</div>
      <div><b>Arrow keys</b> move selected cable</div>
      <div><b>Shift + Arrow</b> resize width</div>
      <div><b>Alt/Option + Left/Right</b> rotate</div>
      <div><b>PageUp/PageDown</b> raise/lower layer</div>
      <div><b>1 / 2 / 5 / 0</b> set step</div>
      <div><b>E</b> export cable JSON</div>
    `;

    document.body.appendChild(panel);
    const selectedLabel = panel.querySelector("#sf-liv028-cable-selected");

    function markSelected() {
      cables.forEach((el, i) => {
        if (i === selectedIndex) {
          el.style.setProperty("outline", "3px solid rgba(255,230,108,.95)", "important");
          el.style.setProperty("outline-offset", "2px", "important");
        } else {
          el.style.removeProperty("outline");
          el.style.removeProperty("outline-offset");
        }
      });

      const el = selected(cables, selectedIndex);
      if (selectedLabel && el) {
        selectedLabel.textContent = `${selectedIndex + 1}/${cables.length}: ${el.dataset.sfLiv028CableKey}`;
      }

      if (el) {
        console.log("[Signal Flow] LIV-028 cable selected", {
          index: selectedIndex + 1,
          total: cables.length,
          key: el.dataset.sfLiv028CableKey
        });
      }
    }

    function move(dx, dy) {
      const el = selected(cables, selectedIndex);
      if (!el) return;
      const left = Math.round(px(el, "left") + dx * step);
      const top = Math.round(px(el, "top") + dy * step);
      setImportant(el, "left", left + "px");
      setImportant(el, "top", top + "px");
      console.log("[Signal Flow] LIV-028 cable move", { key: el.dataset.sfLiv028CableKey, left, top, step });
    }

    function width(dw) {
      const el = selected(cables, selectedIndex);
      if (!el) return;
      const w = Math.max(20, Math.round(px(el, "width") + dw * step));
      setImportant(el, "width", w + "px");
      console.log("[Signal Flow] LIV-028 cable width", { key: el.dataset.sfLiv028CableKey, width: w, step });
    }

    function currentRotate(el) {
      const transform = el.style.getPropertyValue("transform") || "";
      const match = transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
      return match ? parseFloat(match[1]) : 0;
    }

    function rotate(dr) {
      const el = selected(cables, selectedIndex);
      if (!el) return;
      const deg = Math.round((currentRotate(el) + dr * step) * 10) / 10;
      setImportant(el, "transform", "rotate(" + deg + "deg)");
      setImportant(el, "transform-origin", "left center");
      console.log("[Signal Flow] LIV-028 cable rotate", { key: el.dataset.sfLiv028CableKey, rotateDeg: deg, step });
    }

    function z(dz) {
      const el = selected(cables, selectedIndex);
      if (!el) return;
      const current = parseInt(el.style.getPropertyValue("z-index") || getComputedStyle(el).zIndex || "1000", 10) || 1000;
      const zIndex = current + dz;
      setImportant(el, "z-index", zIndex);
      console.log("[Signal Flow] LIV-028 cable z", { key: el.dataset.sfLiv028CableKey, zIndex });
    }

    function exportCables() {
      const data = cables.map(el => ({
        key: el.dataset.sfLiv028CableKey,
        src: el.getAttribute("src") || "",
        alt: el.alt || "",
        leftPx: Math.round(px(el, "left")),
        topPx: Math.round(px(el, "top")),
        widthPx: Math.round(px(el, "width")),
        rotateDeg: currentRotate(el),
        zIndex: getComputedStyle(el).zIndex,
        opacity: parseFloat(getComputedStyle(el).opacity || "1") || 1
      }));

      console.log("[Signal Flow] LIV-028 Normalled Cable Mover export:", data);
      try { window.__sfLiv028CableExport = data; } catch (_) {}
      try { window.parent.__sfLiv028CableExport = data; } catch (_) {}
      try { window.top.__sfLiv028CableExport = data; } catch (_) {}
    }

    document.addEventListener("keydown", event => {
      if (event.target && /input|textarea|select/i.test(event.target.tagName || "")) return;

      let used = true;
      switch (event.key) {
        case "[": selectedIndex = (selectedIndex - 1 + cables.length) % cables.length; markSelected(); break;
        case "]": selectedIndex = (selectedIndex + 1) % cables.length; markSelected(); break;
        case "ArrowLeft": event.altKey ? rotate(-1) : event.shiftKey ? width(-1) : move(-1, 0); break;
        case "ArrowRight": event.altKey ? rotate(1) : event.shiftKey ? width(1) : move(1, 0); break;
        case "ArrowUp": move(0, -1); break;
        case "ArrowDown": move(0, 1); break;
        case "PageUp": z(step); break;
        case "PageDown": z(-step); break;
        case "1": step = 1; console.log("[Signal Flow] LIV-028 cable step", step); used = false; break;
        case "2": step = 2; console.log("[Signal Flow] LIV-028 cable step", step); used = false; break;
        case "5": step = 5; console.log("[Signal Flow] LIV-028 cable step", step); used = false; break;
        case "0": step = 20; console.log("[Signal Flow] LIV-028 cable step", step); used = false; break;
        case "e":
        case "E": exportCables(); break;
        default: used = false;
      }

      if (used) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    markSelected();

    console.log("[Signal Flow] LIV-028 Normalled Cable Mover ready", {
      version: VERSION,
      cables: cables.length
    });

    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 80) clearInterval(timer);
  }, 125);

  console.log("[Signal Flow] LIV-028 Normalled Cable Mover dev script loaded", VERSION);
})();
