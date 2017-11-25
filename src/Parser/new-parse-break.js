  import {TK_ID} from '../other/lexer-constants.js';
  import {_m} from '../other/scope-util.js';
  import {cls} from './cls.js';

cls.parseBreak =
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  var cb = {li: li};
  this.suc(cb, 'bef');
  this.next();
  var label = null;
  if (!this.nl && this.lttype === TK_ID) {
    this.validate(this.ltval);
    label = this.id();
    var target = this.findLabel_m(_m(label.name));
    if (target === null)
      this.err('break.no.such.label');
  }
  else if (!this.scope.canBreak())
    this.err('break.not.in.breakable');

  label && this.spc(label, 'aft');
  this.semi(label ? label.cb : cb, label ? 'aft' : 'break.aft') || this.err('no.semi');

  var ec = this.semiC || (label && label.end) || c;
  var eloc = this.semiLoc ||
    (label && label.loc.end) ||
    { line: li, column: col };

  this.foundStatement = true;
  return {
    type: 'BreakStatement',
    label: label,
    start: c0,
    end: ec,
    loc: { start: loc0, end: eloc },
    '#y': 0,
    '#c': cb
  };
};


