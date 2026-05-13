ObjC.import('Foundation');

var globalThis = this;
var window = this;

function readTextFile(path) {
  var data = $.NSFileManager.defaultManager.contentsAtPath(path);
  if (!data) throw new Error('Missing file: ' + path);

  var str = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding);
  return ObjC.unwrap(str);
}

function assertStrictEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error((message || 'assertion failed') + ': expected ' + expected + ', got ' + actual);
  }
}

var cwd = ObjC.unwrap($.NSFileManager.defaultManager.currentDirectoryPath);
eval(readTextFile(cwd + '/src/signal-flow-ledger.js'));

var Ledger = globalThis.SignalFlowLedger || window.SignalFlowLedger;
if (!Ledger) throw new Error('SignalFlowLedger did not load');

var state = Ledger.createInitialState({
  environmentId: 'live-sound',
  currentLevelId: 'LIV-002'
});

state = Ledger.dispatch(state, { type: 'LEVEL_STARTED', levelId: 'LIV-002' });

state = Ledger.dispatch(state, {
  type: 'ROUTE_COMPLETED',
  levelId: 'LIV-002',
  routeId: 'aux2_to_sub',
  scoreValue: 100,
  creditValue: 25
});

assertStrictEqual(state.totalScore, 100);
assertStrictEqual(state.totalCredits, 25);
assertStrictEqual(Ledger.getAvailableCredits(state), 25);

state = Ledger.dispatch(state, {
  type: 'ROUTE_COMPLETED',
  levelId: 'LIV-002',
  routeId: 'aux2_to_sub',
  scoreValue: 100,
  creditValue: 25
});

assertStrictEqual(state.totalScore, 100, 'repeat correct route should not duplicate score');
assertStrictEqual(state.totalCredits, 25, 'repeat correct route should not duplicate credits');

state = Ledger.dispatch(state, {
  type: 'ROUTE_ATTEMPTED',
  levelId: 'LIV-002',
  routeId: 'wrong_aux_to_sub',
  isCorrect: false
});

assertStrictEqual(state.totalScore, 50);
assertStrictEqual(state.totalCredits, 25, 'wrong attempts should not remove earned credits');

state = Ledger.dispatch(state, {
  type: 'ROUTE_ATTEMPTED',
  levelId: 'LIV-002',
  routeId: 'wrong_aux_to_sub',
  isCorrect: false
});

assertStrictEqual(state.totalScore, 50, 'repeat wrong route should not keep subtracting');

state = Ledger.dispatch(state, { type: 'LEVEL_STARTED', levelId: 'LIV-003' });

var stereoGroup = {
  groupId: 'aux5_to_iem_a_stereo',
  requiredRouteIds: [
    'foh_aux5_l_to_iem_a_l',
    'foh_aux5_r_to_iem_a_r'
  ],
  scoreValue: 100,
  creditValue: 25
};

state = Ledger.dispatch(state, Object.assign({
  type: 'ROUTE_COMPLETED',
  levelId: 'LIV-003',
  routeId: 'foh_aux5_l_to_iem_a_l'
}, stereoGroup));

assertStrictEqual(state.totalScore, 50, 'one stereo side alone should not score');
assertStrictEqual(state.totalCredits, 25, 'one stereo side alone should not earn credits');

state = Ledger.dispatch(state, Object.assign({
  type: 'ROUTE_COMPLETED',
  levelId: 'LIV-003',
  routeId: 'foh_aux5_r_to_iem_a_r'
}, stereoGroup));

assertStrictEqual(state.totalScore, 150, 'completed stereo pair should score once');
assertStrictEqual(state.totalCredits, 50, 'completed stereo pair should earn credits once');

state = Ledger.dispatch(state, Object.assign({
  type: 'ROUTE_COMPLETED',
  levelId: 'LIV-003',
  routeId: 'foh_aux5_r_to_iem_a_r'
}, stereoGroup));

assertStrictEqual(state.totalScore, 150, 'repeating stereo side should not duplicate score');
assertStrictEqual(state.totalCredits, 50, 'repeating stereo side should not duplicate credits');

state = Ledger.dispatch(state, {
  type: 'REWARD_SPENT',
  levelId: 'LIV-005',
  itemId: 'small-pa-kit',
  cost: 30
});

assertStrictEqual(state.spentCredits, 30);
assertStrictEqual(Ledger.getAvailableCredits(state), 20);


state = Ledger.dispatch(state, {
  type: 'REWARD_SPENT',
  levelId: 'LIV-005',
  itemId: 'large-room-grant-test',
  cost: 999
});

assertStrictEqual(Ledger.getAvailableCredits(state), 0, 'overspend should use available credits without throwing');
assertStrictEqual(state.levels['LIV-005'].budgetGrants > 0, true, 'overspend should record a budget grant');

state = Ledger.dispatch(state, { type: 'HINT_USED', levelId: 'LIV-003' });
state = Ledger.dispatch(state, { type: 'LEVEL_COMPLETED', levelId: 'LIV-003' });

assertStrictEqual(state.levels['LIV-003'].grade, 'Clean');

console.log('SignalFlowLedger tests passed');
console.log(JSON.stringify(Ledger.summarize(state), null, 2));
