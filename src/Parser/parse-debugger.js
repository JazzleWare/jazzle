  import {cls} from './ctor.js';

cls.parseDbg = 
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0,
      loc0 = this.loc0(),
      c = this.c,
      li = this.li,
      bl = {},
      col = this.col;

  this.suc(bl, 'bef');
  this.next() ;

  this.semi(bl, 'aft') || this.err('no.semi');

  this.foundStatement = true;
  return {
    type: 'DebuggerStatement',
    loc: { start: loc0, end: this.semiLoc || { line: li, column: col } } ,
    start: c0,
    end: this.semiC || c,
    '#c': bl
  };
};


