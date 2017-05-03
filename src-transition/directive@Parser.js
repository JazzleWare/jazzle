this.insidePrologue =
function() {
  return this.scope.isFunc() &&
    this.scope.insidePrologue();
};

this.exitPrologue =
function() {
  this.scope.exitPrologue();
  this.clearPendingStrictErrors();
};

this.applyDirective =
function(directive) {
  var raw = directive.raw;
  // TODO: which one should apply first?
  if (raw.substring(1,raw.length-1) === 'use strict') {
    this.scope.makeStrict();
    this.applyPendingStrictErrors();
  }
};
