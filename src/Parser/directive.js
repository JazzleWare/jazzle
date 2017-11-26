  import {cls} from './ctor.js';

cls.enterPrologue =
function() {
  this.scope.enterPrologue();
};

cls.exitPrologue =
function() {
  this.scope.exitPrologue();
  this.clearPendingStrictErrors();
};

cls.applyDirective =
function(directiveLiteral) {
  if (this.alreadyApplied) {
    this.alreadyApplied = false;
    return;
  }
  var raw = directiveLiteral.raw;
  // TODO: which one should apply first?
  if (raw.substring(1,raw.length-1) === 'use strict') {
    this.scope.makeStrict();
    this.strict_esc_chk(); // for now it is the sole possible error
  }
};


