import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const launchSource = readFileSync(
  new URL("../launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html", import.meta.url),
  "utf8"
);

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Expected ${name}() in the launch build`);

  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }

  throw new Error(`Could not extract ${name}()`);
}

function createConnectionHarness(initialConnections = []) {
  const state = {
    gameOver: false,
    paused: false,
    connections: initialConnections.map(connection => ({ ...connection })),
    scoredEdges: new Set(
      initialConnections.filter(connection => connection.correct).map(connection => connection.key)
    )
  };
  const effects = { wrongSfx: 0, renders: 0 };
  const edgeKey = (from, to) => `${from}|||${to}`;

  const context = {
    state,
    level: () => ({
      id: "REC-002",
      environment: "studio",
      required: [["Bkg Vocal Tie Line", "Console CH 2 Mic Input"]]
    }),
    isDigitalLevel: () => false,
    connectionAlreadyExists: (from, to) => state.connections.some(connection =>
      (connection.from === from && connection.to === to)
      || (connection.from === to && connection.to === from)
    ),
    isNodeOccupied: node => state.connections.some(connection =>
      connection.from === node || connection.to === node
    ),
    canonicalRequiredEdge: (from, to) => {
      if ((from === "Bkg Vocal Tie Line" && to === "Console CH 2 Mic Input")
        || (from === "Console CH 2 Mic Input" && to === "Bkg Vocal Tie Line")) {
        return {
          from: "Bkg Vocal Tie Line",
          to: "Console CH 2 Mic Input",
          key: edgeKey("Bkg Vocal Tie Line", "Console CH 2 Mic Input"),
          reversed: from !== "Bkg Vocal Tie Line"
        };
      }
      return null;
    },
    canonicalForbiddenEdge: () => null,
    edgeKey,
    createsCycle: () => false,
    connectionScoreKey: connection => connection.key,
    roleForNode: node => node === "Bkg Vocal Tie Line" ? "source" : "destination",
    requiredPairs: () => [["Bkg Vocal Tie Line", "Console CH 2 Mic Input"]],
    sfAwardLedgerScoreOnce: () => {},
    resetTimerForConnection: () => {},
    sfLedgerWrongAttempt: () => {},
    mistakeTeachingMessage: () => "feedback",
    playSfx: name => { if (name === "wrong") effects.wrongSfx += 1; },
    status: () => {},
    markConnectionEnds: () => { effects.renders += 1; },
    renderConnections: () => {},
    renderPaths: () => {},
    renderScore: () => {},
    drawAll: () => {},
    isComplete: () => false,
    completeLevel: () => {}
  };

  vm.runInNewContext(
    `${extractFunction(launchSource, "addConnection")}; this.addConnection = addConnection;`,
    context
  );
  return { ...context, effects };
}

test("REC source repatching atomically replaces a wrong cable with the corrected route", () => {
  const oldRoute = {
    from: "Bkg Vocal Tie Line",
    to: "Console CH 1 Mic Input",
    signalFrom: "Bkg Vocal Tie Line",
    signalTo: "Console CH 1 Mic Input",
    key: "Bkg Vocal Tie Line|||Console CH 1 Mic Input",
    correct: false,
    wrong: true,
    forbidden: false,
    reversed: false
  };
  const harness = createConnectionHarness([oldRoute]);

  harness.addConnection("Bkg Vocal Tie Line", "Console CH 2 Mic Input");

  assert.equal(harness.state.connections.length, 1);
  assert.equal(harness.state.connections[0].to, "Console CH 2 Mic Input");
  assert.equal(harness.state.connections[0].correct, true);
  assert.equal(harness.effects.wrongSfx, 0);
  assert.equal(harness.effects.renders, 1);
});

test("REC source repatching also works when the corrected pair is selected destination first", () => {
  const oldRoute = {
    from: "Bkg Vocal Tie Line",
    to: "Console CH 1 Mic Input",
    key: "Bkg Vocal Tie Line|||Console CH 1 Mic Input",
    correct: false
  };
  const harness = createConnectionHarness([oldRoute]);

  harness.addConnection("Console CH 2 Mic Input", "Bkg Vocal Tie Line");

  assert.equal(harness.state.connections.length, 1);
  assert.equal(harness.state.connections[0].from, "Console CH 2 Mic Input");
  assert.equal(harness.state.connections[0].to, "Bkg Vocal Tie Line");
  assert.equal(harness.state.connections[0].correct, true);
  assert.equal(harness.effects.wrongSfx, 0);
});

test("REC repatching does not remove the old cable when the new destination is occupied", () => {
  const oldRoute = {
    from: "Bkg Vocal Tie Line",
    to: "Console CH 1 Mic Input",
    key: "Bkg Vocal Tie Line|||Console CH 1 Mic Input",
    correct: false
  };
  const occupiedTargetRoute = {
    from: "Lead Vocal Tie Line",
    to: "Console CH 2 Mic Input",
    key: "Lead Vocal Tie Line|||Console CH 2 Mic Input",
    correct: false
  };
  const harness = createConnectionHarness([oldRoute, occupiedTargetRoute]);

  harness.addConnection("Bkg Vocal Tie Line", "Console CH 2 Mic Input");

  assert.deepEqual(
    harness.state.connections.map(connection => [connection.from, connection.to]),
    [
      ["Bkg Vocal Tie Line", "Console CH 1 Mic Input"],
      ["Lead Vocal Tie Line", "Console CH 2 Mic Input"]
    ]
  );
  assert.equal(harness.effects.wrongSfx, 1);
});

test("REC repeated source repatching leaves one cable and updates checklist completion state", () => {
  const harness = createConnectionHarness([]);

  harness.addConnection("Bkg Vocal Tie Line", "Console CH 1 Mic Input");
  harness.addConnection("Bkg Vocal Tie Line", "Console CH 2 Mic Input");
  harness.addConnection("Bkg Vocal Tie Line", "Console CH 1 Mic Input");
  harness.addConnection("Bkg Vocal Tie Line", "Console CH 2 Mic Input");

  assert.equal(harness.state.connections.length, 1);
  assert.equal(harness.state.connections[0].to, "Console CH 2 Mic Input");
  assert.deepEqual(
    [...harness.state.scoredEdges],
    ["Bkg Vocal Tie Line|||Console CH 2 Mic Input"]
  );
});
