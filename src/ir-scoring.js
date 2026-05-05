(function(global){
  'use strict';

  function isAdjacentSize(a, b){
    if(a === b) return true;
    const rank = {none:0, small:1, medium:2, large:3, massive:4};
    if(!(a in rank) || !(b in rank)) return false;
    return Math.abs(rank[a] - rank[b]) <= 1;
  }

  function evaluateIRFit(selectedName, targetName, meta){
    const selected = meta[selectedName];
    const target = meta[targetName];
    if(!selected || !target){
      return { stars: 1, points: 25, label: 'Unknown IR', feedback: 'This selection could not be evaluated.' };
    }
    if(selected.alwaysOneStar || selectedName === 'Plate' || selectedName === 'Reverse'){
      return { stars: 1, points: 25, label: 'Effect choice', feedback: 'This effect does not represent a natural space.' };
    }
    if(selectedName === targetName){
      return { stars: 3, points: 100, label: 'Excellent fit', feedback: 'This space matches well. The size and reflections feel natural.' };
    }
    const envMatch = selected.env === target.env;
    const sizeClose = isAdjacentSize(selected.size, target.size);
    const sameKind = selected.kind === target.kind;

    // Forgiving scoring: one strong structural match or a close size relationship earns two stars.
    if(envMatch || sizeClose || sameKind){
      return { stars: 2, points: 50, label: 'Acceptable fit', feedback: 'This works, but the space feels slightly different in size or material.' };
    }
    return { stars: 1, points: 25, label: 'Poor fit', feedback: 'This feels mismatched. The space is too dry or too reflective.' };
  }

  global.SF_IR_SCORING = { evaluateIRFit, isAdjacentSize };
})(window);
