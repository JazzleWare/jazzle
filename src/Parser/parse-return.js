  import {CTX_NULLABLE, CTX_TOP} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {cls} from './ctor.js';

cls.parseReturn = function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false ) ;

  if (!this.scope.canReturn()) 
    this.err('return.not.in.a.function');

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  var b = {}, r = null;

  this.suc(b, 'bef' );
  this.next(); // 'return'

  if (!this.nl)
    r = this.parseExpr(CTX_NULLABLE|CTX_TOP);

  this.semi(r ? r['#c'] : b, r ? 'aft' : 'ret.aft') || this.err('no.semi');
  var ec = this.semiC || (r && r.end) || c;
  var eloc = this.semiLoc ||
    (r && r.loc.end) ||
    { line: li, column: col };

  this.foundStatement = true;
  return { 
    type: 'ReturnStatement',
    argument: r && core(r),
    start: c0,
    end: ec,
    loc: { start: loc0, end: eloc },
    '#c': b,
    '#y': this.Y0(r)
  };
};


