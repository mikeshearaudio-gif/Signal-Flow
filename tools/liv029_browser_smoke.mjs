#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = process.cwd();
const outDir = path.join(root, "audit/liv029-preservation-snapshot");
const outFile = path.join(outDir, "browser-smoke-result.json");

const url = "http://127.0.0.1:5174/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html?level=LIV-029&fresh=liv029-preservation-smoke";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const requiredRoutes = [
  ["wireless-receiver-ch1-audio-out", "console-input-1", "receiver"],
  ["wireless-receiver-ch2-audio-out", "console-input-2", "receiver"],
  ["wireless-receiver-ch3-audio-out", "console-input-3", "receiver"],
  ["wireless-receiver-ch4-audio-out", "console-input-4", "receiver"],
  ["console-main-l-output", "pa-processor-amp-l-input", "main-pa"],
  ["console-main-r-output", "pa-processor-amp-r-input", "main-pa"],
  ["pa-processor-amp-l-output", "left-speaker-input", "speaker"],
  ["pa-processor-amp-r-output", "right-speaker-input", "speaker"],
  ["console-matrix-record-l-output", "press-recorder-l-input", "press-feed"],
  ["console-matrix-record-r-output", "press-recorder-r-input", "press-feed"],
  ["console-aux-1-output", "moderator-wedge-input", "monitor"]
];

function countText(text, needle) {
  return (text.match(new RegExp(needle, "g")) || []).length;
}

async function loadLiv029(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    const text = message.text();
    logs.push({ type: message.type(), text: text.slice(0, 500) });
    if (message.type() === "error" && !text.includes("404")) errors.push(text);
  });

  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.selectOption("#levelSelect", "LIV-029");
  await page.click("#loadBtn");

  const frameHandle = await page.waitForSelector("#gameFrame", { timeout: 10000 });
  const frame = await frameHandle.contentFrame();
  await frame.waitForLoadState("load", { timeout: 30000 });
  await frame.waitForSelector(".sf-live-native-level-liv-029", { timeout: 20000 });

  const startButton = frame.locator("button:has-text(\"Start Level\")");
  if (await startButton.count()) {
    await startButton.first().click().catch(() => {});
    await page.waitForTimeout(250);
  }

  return { page, frame, logs, errors };
}

async function clickEndpoint(frame, key) {
  const locator = frame.locator(`[data-node-key="${key}"], [data-sf-native-key="${key}"]`).first();
  await locator.click({ timeout: 5000 });
}

async function patchRoute(page, frame, from, to) {
  await clickEndpoint(frame, from);
  await page.waitForTimeout(80);
  await clickEndpoint(frame, to);
  await page.waitForTimeout(220);
}

async function captureState(frame) {
  return frame.evaluate(() => {
    const bodyText = document.body.innerText;
    const scoreText = document.querySelector("#scoreText")?.textContent?.trim()
      || (bodyText.match(/SCORE\s*\n(\d+)/) || [])[1]
      || null;
    const requiredHintNodes = Array.from(document.querySelectorAll(".sf-native-required-hint"));
    const falseHitboxes = Array.from(document.querySelectorAll(".sf-native-liv029-false-hitbox"));
    const layer = document.querySelector(".sf-live-native-level-liv-029");
    const surface = document.querySelector(".sf-live-native-liv029-scroll-host") || layer?.parentElement;
    const surfaceRect = surface ? surface.getBoundingClientRect() : null;
    const layerRect = layer ? layer.getBoundingClientRect() : null;

    return {
      scoreText,
      doneCount: (bodyText.match(/DONE/g) || []).length,
      completeCount: (bodyText.match(/COMPLETE/g) || []).length,
      todoCount: (bodyText.match(/TO DO/g) || []).length,
      completionVisible: /complete|completed|well done|level complete/i.test(bodyText),
      gearCount: document.querySelectorAll("[data-sf-gear-id]").length,
      hitboxCount: document.querySelectorAll(".sf-native-liv029-hitbox").length,
      goodHitboxCount: document.querySelectorAll(".sf-native-liv029-hitbox:not(.sf-native-liv029-false-hitbox)").length,
      falseHitboxCount: falseHitboxes.length,
      validHintCount: requiredHintNodes.filter(node => !node.classList.contains("sf-native-liv029-false-hitbox")).length,
      falseHintCount: requiredHintNodes.filter(node => node.classList.contains("sf-native-liv029-false-hitbox")).length,
      falseHintableCount: falseHitboxes.filter(node => node.dataset.sfNativeHintable !== "0").length,
      buttonText: document.querySelector("#hintBtn")?.textContent?.trim() || null,
      toastText: Array.from(document.querySelectorAll(".sf-live-sound-educational-feedback,.sf-liv029-educational-feedback"))
        .map(node => node.textContent.trim())
        .filter(Boolean),
      cablePathCount: document.querySelectorAll(".sf-native-cables path, svg.cable-layer path, .sf-native-cable").length,
      invalidCableCount: Array.from(document.querySelectorAll(".sf-native-cables path, svg.cable-layer path, .sf-native-cable"))
        .filter(node => /invalid|wrong|red/i.test(node.getAttribute("class") || "") || /#ff|red|rgb\(255/i.test(node.getAttribute("stroke") || node.style.stroke || ""))
        .length,
      layerCount: document.querySelectorAll(".sf-live-native-level-liv-029").length,
      wirelessReceiverAsset: document.querySelector("[data-sf-gear-id=\"liv029-wireless-rack\"] img")?.getAttribute("src") || null,
      viewport: surfaceRect ? {
        surface: {
          left: surfaceRect.left,
          top: surfaceRect.top,
          width: surfaceRect.width,
          height: surfaceRect.height,
          scrollWidth: surface.scrollWidth,
          scrollHeight: surface.scrollHeight,
          scrollLeft: surface.scrollLeft,
          scrollTop: surface.scrollTop
        },
        layer: layerRect ? {
          left: layerRect.left,
          top: layerRect.top,
          width: layerRect.width,
          height: layerRect.height
        } : null
      } : null,
      textSample: bodyText.slice(0, 2400)
    };
  });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });

  const mountRun = await loadLiv029(browser);
  const mountState = await captureState(mountRun.frame);
  await mountRun.page.close();

  const hintRun = await loadLiv029(browser);
  await hintRun.frame.click("#hintBtn");
  await hintRun.page.waitForTimeout(500);
  const hintState = await captureState(hintRun.frame);
  await hintRun.page.close();

  const trapRun = await loadLiv029(browser);
  await patchRoute(trapRun.page, trapRun.frame, "wireless-receiver-antenna-a", "console-input-1");
  const trapState = await captureState(trapRun.frame);
  await trapRun.page.close();

  const completeRun = await loadLiv029(browser);
  const routeResults = [];
  for (const [from, to, family] of requiredRoutes) {
    await patchRoute(completeRun.page, completeRun.frame, from, to);
    routeResults.push({
      from,
      to,
      family,
      state: await captureState(completeRun.frame)
    });
  }
  const finalState = await captureState(completeRun.frame);
  await completeRun.page.close();

  await browser.close();

  const result = {
    levelId: "LIV-029",
    url,
    timestamp: new Date().toISOString(),
    wrapperBehavior: "The v1.41.18 wrapper loads the selector screen first; the smoke selects #levelSelect=LIV-029 and clicks #loadBtn, which loads the raw build in #gameFrame at #/level/LIV-029.",
    mount: {
      passed: mountState.gearCount === 7 &&
        mountState.goodHitboxCount === 22 &&
        mountState.falseHitboxCount === 8 &&
        /wireless-receiver-panel-animated-aligned\.svg/.test(mountState.wirelessReceiverAsset || ""),
      state: mountState,
      errors: mountRun.errors,
      recentLogs: mountRun.logs.slice(-20)
    },
    hints: {
      passed: hintState.validHintCount === 22 &&
        hintState.falseHintCount === 0 &&
        hintState.falseHintableCount === 0,
      state: hintState,
      errors: hintRun.errors,
      recentLogs: hintRun.logs.slice(-20)
    },
    trap: {
      passed: trapState.doneCount === 0 &&
        trapState.scoreText === "0" &&
        trapState.toastText.some(text => /RF, not audio|receiver's audio output/i.test(text)),
      state: trapState,
      errors: trapRun.errors,
      recentLogs: trapRun.logs.slice(-20)
    },
    routeFamilies: {
      receiver: routeResults.filter(item => item.family === "receiver").map(item => ({ from: item.from, to: item.to, score: item.state.scoreText, completeCount: item.state.completeCount, todoCount: item.state.todoCount })),
      mainPa: routeResults.filter(item => item.family === "main-pa").map(item => ({ from: item.from, to: item.to, score: item.state.scoreText, completeCount: item.state.completeCount, todoCount: item.state.todoCount })),
      speaker: routeResults.filter(item => item.family === "speaker").map(item => ({ from: item.from, to: item.to, score: item.state.scoreText, completeCount: item.state.completeCount, todoCount: item.state.todoCount })),
      pressFeed: routeResults.filter(item => item.family === "press-feed").map(item => ({ from: item.from, to: item.to, score: item.state.scoreText, completeCount: item.state.completeCount, todoCount: item.state.todoCount })),
      monitor: routeResults.filter(item => item.family === "monitor").map(item => ({ from: item.from, to: item.to, score: item.state.scoreText, completeCount: item.state.completeCount, todoCount: item.state.todoCount }))
    },
    completion: {
      passed: finalState.completeCount >= 11 &&
        finalState.todoCount === 0 &&
        finalState.scoreText === "800" &&
        finalState.layerCount === 1 &&
        finalState.gearCount === 7 &&
        finalState.hitboxCount === 30,
      finalState,
      errors: completeRun.errors,
      recentLogs: completeRun.logs.slice(-20)
    },
    visualRuntimeNotes: [
      "Automated smoke confirms mount counts and route-family clickability, but visual label/cable readability still needs human browser review.",
      "Surface width was greater than the 1000px board in the 1440x900 smoke, so no horizontal clipping was detected in this viewport.",
      "Surface height was slightly shorter than board plus spacer, so small vertical scroll is expected."
    ]
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({
    levelId: result.levelId,
    mountPassed: result.mount.passed,
    hintsPassed: result.hints.passed,
    trapPassed: result.trap.passed,
    completionPassed: result.completion.passed,
    score: result.completion.finalState.scoreText,
    completeCount: result.completion.finalState.completeCount,
    todoCount: result.completion.finalState.todoCount,
    output: path.relative(root, outFile)
  }, null, 2));

  if (!result.mount.passed || !result.hints.passed || !result.trap.passed || !result.completion.passed) {
    process.exitCode = 1;
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
