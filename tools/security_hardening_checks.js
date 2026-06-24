#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = [
  'index.html',
  'launch/ir-level-runner.html',
  'launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html',
  'launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html',
  'launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html'
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasMeta(html, httpEquivOrName, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return tags.some(tag => {
    const keyRe = new RegExp(`(?:http-equiv|name)=["']${httpEquivOrName}["']`, 'i');
    if (!keyRe.test(tag)) return false;
    const content = tag.match(/\bcontent=(["'])([\s\S]*?)\1/i);
    return !!content && content[2].includes(value);
  });
}

for (const rel of htmlFiles) {
  const html = read(rel);
  assert(hasMeta(html, 'Content-Security-Policy', "object-src 'none'"), `${rel} is missing object-src CSP hardening`);
  assert(hasMeta(html, 'Content-Security-Policy', "base-uri 'self'"), `${rel} is missing base-uri CSP hardening`);
  assert(hasMeta(html, 'referrer', 'no-referrer'), `${rel} is missing no-referrer policy`);
}

for (const rel of ['launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html', 'launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html']) {
  const html = read(rel);
  const iframeMatch = html.match(/<iframe\b[^>]*id=["']gameFrame["'][^>]*>/i);
  assert(iframeMatch, `${rel} is missing the gameFrame iframe`);
  const iframe = iframeMatch[0];
  assert(/\bsandbox=["'][^"']*allow-scripts[^"']*allow-same-origin[^"']*["']/i.test(iframe), `${rel} gameFrame iframe is not sandboxed for scripts and same-origin app state`);
  assert(!/sandbox=["'][^"']*allow-top-navigation/i.test(iframe), `${rel} gameFrame iframe allows top navigation`);
  assert(/\breferrerpolicy=["']no-referrer["']/i.test(iframe), `${rel} gameFrame iframe is missing no-referrer`);
}

const wrapper18 = read('launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html');
assert(/function isAllowedWrapperMessage\(/.test(wrapper18), 'v1.41.18 wrapper is missing message type/schema validation');
assert(/ALLOWED_WRAPPER_MESSAGE_TYPES/.test(wrapper18), 'v1.41.18 wrapper is missing an allow-list for message types');
assert(/ev\.source !== frame\.contentWindow/.test(wrapper18), 'v1.41.18 wrapper does not validate message source');

const runner = read('launch/ir-level-runner.html');
assert(/function safeParentPostMessage\(/.test(runner), 'IR runner is missing a safe parent postMessage wrapper');
assert(/SF_IR_PARENT_MESSAGE_TYPES/.test(runner), 'IR runner is missing an outbound message type allow-list');

console.log('Security hardening checks passed.');
