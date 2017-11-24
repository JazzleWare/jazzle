  import {HAS} from '../other/constants.js';
  import {cls} from './cls.js';

this.findLabel_m = 
function(mname) {
  return HAS.call(this.labels, mname) ?
    this.labels[mname] : null;
};

this.testStmt = 
function() {
  if (this.canBeStatement) {
    this.canBeStatement = false;
    return true;
  }
  return false;
};

// NOTE: great care has to be taken to use this.unsatisfiedLabel such that it won't get overwritten.
// the recommended way is to use fixupLabels at the very beginning of relevant parse routine, or at least before calling
// any parse routine that might overwrite this.unsatisfiedLabel
this.fixupLabels =
function(isLoop) {
  if (this.unsatisfiedLabel) {
    this.unsatisfiedLabel.loop = isLoop;
    this.unsatisfiedLabel = null;
  }
};

this.stmtList =
function () {
  var stmt = null, y = 0, list = [];
  var last = null;
  while (stmt = this.parseStatement(true)) {
    y += this.Y0(stmt);
    list.push(stmt);
    last = stmt;
  }  
  last && this.spc(last, 'aft');

  this.yc = y;
  return list;
};

// TODO: eliminate
this.fixupLabel =
function(label, isLoop) {
  label.loop = isLoop;
};

