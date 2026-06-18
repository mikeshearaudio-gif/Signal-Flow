#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const launchPath = path.join(root, 'launch', 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html');
const manifestPath = path.join(root, 'assets', 'build-room', 'build-room-manifest-v4.json');

function slugify(value) {
  return String(value || '').toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function titleCaseish(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeName(name) {
  let n = titleCaseish(name);
  const replacements = [
    [/^stage wedge mix$/i, 'Stage monitor'],
    [/^phone hybrid send$/i, 'Broadcast Phone System'],
    [/^foh matrix( 1)?$/i, 'Matrix router'],
    [/^getner$/i, 'Broadcast Phone System'],
    [/^gentner phone hybrid$/i, 'Broadcast Phone System'],
    [/^telephone hybrid$/i, 'Broadcast Phone System'],
    [/^ifb receiver \/ beltpack$/i, 'IFB beltpack receiver'],
    [/^ifb interface$/i, 'IFB transmitter'],
    [/^system matrix$/i, 'Matrix router'],
    [/^portable multichannel recorder \/ field recorder$/i, 'Field recorder / portable multichannel recorder'],
    [/^mic stand \/ field mic stand kit$/i, 'Mic stand kit'],
    [/^daw \/ computer workstation$/i, 'DAW workstation']
  ];
  for (const [re, rep] of replacements) if (re.test(n)) return rep;
  if (/tie line/i.test(n)) return 'XLR cable';
  if (/aux\s*\d*\s*output/i.test(n)) return 'TT patch cable';
  if (/fx return/i.test(n)) return '16x4x2 live console';
  if (/plate reverb output/i.test(n)) return 'Plate reverb';
  if (/console ch .*mic input|channel .*input/i.test(n)) return '16x4x2 recording console';
  if (/program bus output/i.test(n)) return '16x4x2 broadcast console';
  if (/stream encoder input/i.test(n)) return 'Stream encoder';
  if (/iem tx|iem transmitter input/i.test(n)) return 'IEM transmitter';
  return n;
}

function categoryFor(name) {
  const n = String(name || '').toLowerCase();
  if (/cable|loom|trs|xlr|tt patch|instrument cable|di box/.test(n)) return 'Cables / DI';
  if (/mic|microphone|condenser|shotgun|boundary|contact|talkback/.test(n)) return 'Mics';
  if (/console|mixer/.test(n)) return 'Consoles / Mixers';
  if (/interface|daw|recorder|encoder|computer|workstation/.test(n)) return 'Interfaces / Recorders';
  if (/reverb|compressor|eq|processor|matrix|crossover|splitter|loudness|downmix|patchbay/.test(n)) return 'Processors / Routing';
  if (/iem|ifb|earpiece|earbud|headphone|beltpack/.test(n)) return 'Monitoring / IFB';
  if (/speaker|monitor|pa|stage monitor|front fill/.test(n)) return 'Speakers / Monitors';
  if (/stand|mount|wind|foley|kit/.test(n)) return 'Accessories';
  return 'General';
}

function estimatedCost(name) {
  const n = String(name || '').toLowerCase();
  if (/cable|loom/.test(n)) return /set|pair/.test(n) ? 10 : 5;
  if (/di box/.test(n)) return 10;
  if (/mic stand|mount|wind|foley/.test(n)) return 10;
  if (/earbud|headphone|earpiece/.test(n)) return 15;
  if (/dynamic|handheld|broadcast dynamic/.test(n)) return 15;
  if (/condenser|shotgun|boundary|contact/.test(n)) return 25;
  if (/interface|recorder|encoder|transmitter|receiver|beltpack/.test(n)) return 30;
  if (/console|mixer/.test(n)) return /48x|24x/.test(n) ? 120 : /16x/.test(n) ? 50 : 45;
  if (/speaker|pa|monitor/.test(n)) return 25;
  if (/stagebox/.test(n)) return 15;
  if (/reverb|compressor|eq|processor|matrix|crossover|splitter|loudness|downmix|patchbay|broadcast phone/.test(n)) return 25;
  return 20;
}

function itemCost(item) {
  return Number(item && item.cost != null ? item.cost : estimatedCost(item && item.name));
}

function requiredCost(required) {
  return (required || []).reduce((sum, item) => sum + itemCost(item) * Number(item && item.qty || 1), 0);
}

function tierStarterAllowed(item) {
  const name = String(item && item.name || '').toLowerCase();
  const category = String(item && item.category || categoryFor(item && item.name) || '').toLowerCase();
  if (/processor|matrix|crossover|splitter|loudness|downmix|patchbay|broadcast phone|ifb|iem|speaker|pa|front fill|stage monitor|monitor pair|headphone|earbud|beltpack|reverb|compressor|eq|dolby|renderer|advanced|rack/.test(name)) return false;
  if (/processors|routing|speakers|monitors|ifb/.test(category)) return false;
  if (/encoder/.test(name)) return false;
  if (/boundary|contact/.test(name)) return false;
  return /cable|loom|trs|xlr|usb|instrument|di box|mic|microphone|preamp|interface|recorder|daw|console|mixer|stagebox|snake|stand|mount|wind|foley|kit/.test(name + ' ' + category);
}

function extractLaunchData() {
  const html = fs.readFileSync(launchPath, 'utf8');
  const start = html.indexOf('window.SIGNAL_FLOW_V12 =');
  if (start < 0) throw new Error('Could not find SIGNAL_FLOW_V12 in launch file.');
  const end = html.indexOf('</script>', start);
  const code = html.slice(start, end);
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context, { timeout: 1000 });
  return context.window.SIGNAL_FLOW_V12;
}

function priorLedgerCredits(levels, roomIds) {
  const out = {};
  const creditByEnv = {};
  levels.forEach(level => {
    const env = String(level.environment || '');
    const credits = Number(creditByEnv[env] || 0);
    if (roomIds.has(String(level.id || '').toUpperCase())) out[String(level.id).toUpperCase()] = credits;
    if (!env) return;
    creditByEnv[env] = credits + 25;
    if (level.training && String(level.training.type || '').toLowerCase() === 'quiz') creditByEnv[env] += 25;
  });
  return out;
}

function normalizeTieredLevel(level, tier, priorCredits) {
  const copy = JSON.parse(JSON.stringify(level));
  copy.tier = tier;
  copy.required = (copy.required || []).map(item => Object.assign({}, item, {
    name: normalizeName(item.name),
    category: item.category || categoryFor(item.name)
  }));
  copy.store = (copy.store || []).map(item => Object.assign({}, item, {
    name: normalizeName(item.name),
    category: item.category || categoryFor(item.name)
  }));
  if (tier !== 1 || requiredCost(copy.required) <= priorCredits) return copy;

  const selected = [];
  const demoted = [];
  let total = 0;
  copy.required.forEach(item => {
    const cost = itemCost(item) * Number(item.qty || 1);
    if (tierStarterAllowed(item) && total + cost <= priorCredits) {
      selected.push(item);
      total += cost;
    } else {
      demoted.push(item);
    }
  });
  if (selected.length) {
    copy.required = selected;
    const demotedSlugs = new Set(demoted.map(item => slugify(item.name)));
    copy.store = copy.store.map(item => demotedSlugs.has(slugify(item.name))
      ? Object.assign({}, item, { role: 'distractor', satisfies: '', notes: item.notes || 'Tier 1 optional/overkill gear.' })
      : item);
  }
  return copy;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const data = extractLaunchData();
const roomIds = new Set(manifest.levels.map(level => String(level.level_id || '').toUpperCase()));
const priorByLevel = priorLedgerCredits(data.levels || [], roomIds);
const envCounts = {};
const rows = manifest.levels.map(level => {
  const envKey = String(level.environment || '').toLowerCase();
  envCounts[envKey] = Number(envCounts[envKey] || 0) + 1;
  const tier = envCounts[envKey];
  const prior = Number(priorByLevel[String(level.level_id || '').toUpperCase()] || 0);
  const normalized = normalizeTieredLevel(level, tier, prior);
  const cost = requiredCost(normalized.required);
  return {
    env: level.environment,
    levelId: level.level_id,
    tier,
    prior,
    cost,
    status: cost <= prior ? 'OK' : 'FAIL'
  };
});

rows.forEach(row => {
  console.log(`${row.env}\t${row.levelId}\tTier ${row.tier}\tactual prior credits ${row.prior}\trequired cost ${row.cost}\t${row.status}`);
});

const failures = rows.filter(row => row.status !== 'OK');
if (failures.length) process.exitCode = 1;
