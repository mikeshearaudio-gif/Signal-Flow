#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:5174/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/LIV-004';

async function seedLedger(page, credits) {
  await page.waitForFunction(() => window.SignalFlowLedger && typeof window.sfLedgerState === 'function', { timeout: 10000 });
  await page.evaluate(value => {
    const state = window.SignalFlowLedger.createInitialState({
      environmentId: 'live-sound',
      currentLevelId: 'LIV-004'
    });
    state.totalCredits = value;
    state.spentCredits = 0;
    window.sfSignalFlowLedgerState = state;
    try { window.parent.sfSignalFlowLedgerState = state; } catch (_) {}
  }, credits);
  await page.evaluate(() => window.dispatchEvent(new Event('hashchange')));
}

async function addItem(page, name) {
  const card = page.locator('.sf-br-card').filter({ hasText: name }).first();
  await card.locator('[data-sf-br-step="1"]').click();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];

  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/Failed to load resource: the server responded with a status of 404/.test(message.text())) {
      errors.push(message.text());
    }
  });

  await page.goto(URL, { waitUntil: 'load' });
  await seedLedger(page, 100);
  await page.waitForSelector('.sf-build-room-v6r227[data-level-id="LIV-004"]', { timeout: 10000 });
  await page.waitForFunction(() => {
    return [...document.querySelectorAll('.sf-br-metric')]
      .some(el => /Credits available/.test(el.textContent) && /100/.test(el.textContent));
  }, { timeout: 10000 });

  const metric = await page.locator('.sf-br-metric').filter({ hasText: 'Credits available' }).innerText();
  const needs = await page.locator('.sf-br-need-name').allInnerTexts();

  for (const [name, qty] of [['Handheld dynamic cardioid mic', 1], ['XLR cable', 4], ['Stagebox', 1], ['16x4x2 live console', 1]]) {
    for (let i = 0; i < qty; i += 1) await addItem(page, name);
  }
  await page.locator('[data-sf-br-action="check"]').click();
  await page.waitForSelector('.sf-br-modal:has-text("Room Approved")', { timeout: 5000 });
  const approved = await page.locator('.sf-br-modal').innerText();

  await page.evaluate(() => {
    sessionStorage.removeItem('signal-flow-build-room-selection-v6r227');
    const state = window.SignalFlowLedger.createInitialState({
      environmentId: 'live-sound',
      currentLevelId: 'LIV-004'
    });
    state.totalCredits = 200;
    state.spentCredits = 0;
    window.sfSignalFlowLedgerState = state;
  });
  await page.reload({ waitUntil: 'load' });
  await seedLedger(page, 200);
  await page.waitForSelector('.sf-build-room-v6r227[data-level-id="LIV-004"]', { timeout: 10000 });

  for (const [name, qty] of [['Handheld dynamic cardioid mic', 1], ['XLR cable', 4], ['Stagebox', 1], ['16x4x2 live console', 1], ['System processor', 1]]) {
    for (let i = 0; i < qty; i += 1) await addItem(page, name);
  }
  await page.locator('[data-sf-br-action="check"]').click();
  await page.waitForSelector('.sf-br-modal:has-text("Room Needs Revision")', { timeout: 5000 });
  const wrong = await page.locator('.sf-br-modal').innerText();

  await browser.close();

  const result = {
    metric,
    needs,
    approved: approved.split('\n')[0],
    wrong: wrong.split('\n').slice(0, 3),
    errors
  };
  console.log(JSON.stringify(result, null, 2));

  if (!/100/.test(metric) || !/Room Approved/.test(approved) || !/System processor/.test(wrong) || errors.length) {
    process.exit(1);
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
