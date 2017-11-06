this.parseFunBody =
function() {
  if (this.lttype !== CH_LCURLY)
    this.err('fun.body.not.a.curly');

  var c0 = this.c0;
  var loc0 = this.loc0();

  var cb = {}; this.suc(cb, 'bef' );
  this.next(); // '{'

  this.enterPrologue();
  var list = this.stmtList();

  this.suc(cb, 'inner');
  var n = {
    type : 'BlockStatement',
    body: list,
    start: c0,
    end: this.c,
    loc: { 
      start: loc0,
      end: this.loc() },
    '#y': this.yc, '#c': cb
  };

  if (!this.expectT(CH_RCURLY))
    this.err('fun.body.is.unfinished');

  return n;
};
