  import {CTX_NULLABLE, CTX_TOP} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {cls} from './cls.js';

cls.parseThrow =
function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false ) ;

  var ex = null, c0 = this.c0, loc0 = this.loc0();
  var li = this.li, c = this.c, col = this.col;

  var b = {}; this.suc(b, 'bef');
  this.next(); // 'throw'

  if (this.nl)
    this.err('throw.has.newline');

  ex = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  if (ex === null)
    this.err('throw.has.no.argument');

  this.semi(core(ex)['#c'], 'aft') || this.err('no.semi');

  this.foundStatement = true;
  return {
    type: 'ThrowStatement',
    argument: core(ex),
    start: c0,
    end: this.semiC || ex.end,
    loc: {
      start: loc0,
      end: this.semiLoc || ex.loc.end
    },
    '#c': b,
    '#y': this.Y(ex)
  };
};


