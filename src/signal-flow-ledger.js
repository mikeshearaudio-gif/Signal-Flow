(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SignalFlowLedger = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const VERSION = 'signal-flow-ledger-v1';

  const DEFAULT_RULES = Object.freeze({
    correctScore: 100,
    wrongPenalty: 50,
    correctCredits: 25,
    minScore: 0
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createInitialState(options) {
    const opts = options || {};
    return {
      version: VERSION,
      environmentId: opts.environmentId || 'live-sound',
      currentLevelId: opts.currentLevelId || null,
      totalScore: 0,
      totalCredits: 0,
      spentCredits: 0,
      levels: {},
      history: []
    };
  }

  function ensureLevel(state, levelId) {
    if (!levelId) throw new Error('SignalFlowLedger requires a levelId');

    if (!state.levels[levelId]) {
      state.levels[levelId] = {
        score: 0,
        creditsEarned: 0,
        creditsSpent: 0,
        completed: false,
        grade: null,
        hintsUsed: 0,
        wrongAttempts: [],
        completedRoutes: [],
        completedGroups: [],
        awardedGroups: [],
        rewardPurchases: []
      };
    }

    return state.levels[levelId];
  }

  function uniquePush(list, value) {
    if (value && list.indexOf(value) === -1) list.push(value);
  }

  function applyScoreDelta(state, level, delta, rules) {
    const nextTotal = Math.max(rules.minScore, state.totalScore + delta);
    const actualDelta = nextTotal - state.totalScore;

    state.totalScore = nextTotal;
    level.score = Math.max(rules.minScore, level.score + actualDelta);
  }

  function getAvailableCredits(state) {
    return Math.max(0, (state.totalCredits || 0) - (state.spentCredits || 0));
  }

  function getGrade(level) {
    if (!level || !level.completed) return null;
    if (level.wrongAttempts.length === 0 && level.hintsUsed === 0) return 'Perfect';
    if (level.wrongAttempts.length <= 2) return 'Clean';
    return 'Completed';
  }

  function withHistory(state, event) {
    state.history.push({
      type: event.type,
      levelId: event.levelId || state.currentLevelId || null,
      routeId: event.routeId || null,
      groupId: event.groupId || null,
      itemId: event.itemId || null
    });
  }

  function dispatch(inputState, event, rulesOverride) {
    if (!event || !event.type) {
      throw new Error('SignalFlowLedger.dispatch requires an event with a type');
    }

    const rules = Object.assign({}, DEFAULT_RULES, rulesOverride || {});
    const state = clone(inputState || createInitialState());

    if (event.type === 'RESET') {
      return createInitialState({
        environmentId: event.environmentId || state.environmentId,
        currentLevelId: event.currentLevelId || null
      });
    }

    const levelId = event.levelId || state.currentLevelId;

    if (event.type === 'LEVEL_STARTED') {
      state.currentLevelId = levelId;
      ensureLevel(state, levelId);
      withHistory(state, event);
      return state;
    }

    const level = ensureLevel(state, levelId);

    if (event.type === 'HINT_USED') {
      level.hintsUsed += 1;
      withHistory(state, event);
      return state;
    }

    if (event.type === 'ROUTE_ATTEMPTED') {
      if (event.isCorrect) {
        withHistory(state, event);
        return state;
      }

      const attemptId = event.attemptId || event.routeId;
      if (!attemptId) throw new Error('ROUTE_ATTEMPTED requires attemptId or routeId');

      if (level.wrongAttempts.indexOf(attemptId) === -1) {
        level.wrongAttempts.push(attemptId);
        applyScoreDelta(
          state,
          level,
          -(event.penaltyValue != null ? event.penaltyValue : rules.wrongPenalty),
          rules
        );
      }

      withHistory(state, event);
      return state;
    }

    if (event.type === 'ROUTE_COMPLETED') {
      if (!event.routeId) throw new Error('ROUTE_COMPLETED requires routeId');

      const groupId = event.groupId || event.routeId;
      const requiredRouteIds = event.requiredRouteIds || [event.routeId];

      uniquePush(level.completedRoutes, event.routeId);

      const groupComplete = requiredRouteIds.every(function (routeId) {
        return level.completedRoutes.indexOf(routeId) !== -1;
      });

      if (groupComplete && level.awardedGroups.indexOf(groupId) === -1) {
        uniquePush(level.completedGroups, groupId);
        uniquePush(level.awardedGroups, groupId);

        applyScoreDelta(
          state,
          level,
          event.scoreValue != null ? event.scoreValue : rules.correctScore,
          rules
        );

        const creditValue = event.creditValue != null ? event.creditValue : rules.correctCredits;
        state.totalCredits += creditValue;
        level.creditsEarned += creditValue;
      }

      withHistory(state, event);
      return state;
    }

    if (event.type === 'REWARD_SPENT') {
      const itemId = event.itemId;
      const cost = Number(event.cost || 0);

      if (!itemId) throw new Error('REWARD_SPENT requires itemId');
      if (cost < 0) throw new Error('REWARD_SPENT cost cannot be negative');

      if (level.rewardPurchases.indexOf(itemId) !== -1) {
        withHistory(state, event);
        return state;
      }

      if (cost > getAvailableCredits(state)) throw new Error('Not enough credits for reward purchase');

      state.spentCredits += cost;
      level.creditsSpent += cost;
      uniquePush(level.rewardPurchases, itemId);

      withHistory(state, event);
      return state;
    }

    if (event.type === 'LEVEL_COMPLETED') {
      level.completed = true;
      level.grade = getGrade(level);
      withHistory(state, event);
      return state;
    }

    throw new Error('Unknown SignalFlowLedger event type: ' + event.type);
  }

  function summarize(state) {
    return {
      environmentId: state.environmentId,
      currentLevelId: state.currentLevelId,
      totalScore: state.totalScore,
      totalCredits: state.totalCredits,
      spentCredits: state.spentCredits,
      availableCredits: getAvailableCredits(state),
      completedLevels: Object.keys(state.levels || {}).filter(function (levelId) {
        return state.levels[levelId].completed;
      })
    };
  }

  return {
    VERSION,
    DEFAULT_RULES,
    createInitialState,
    dispatch,
    getAvailableCredits,
    getGrade,
    summarize
  };
});
