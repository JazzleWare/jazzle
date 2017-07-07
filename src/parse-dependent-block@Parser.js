this.parseDependent = 
function(name) {
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');

  if (!this.expectT(CH_LCURLY))
    this.err('block.dependent.no.opening.curly',{extra:{name:name}});

  var n = {
    type: 'BlockStatement',
    body: this.stmtList(),
    start: c0,
    end: this.c,
    loc: {
      start: loc0,
      end: this.loc() },
    '#y': this.yc, '#c': cb
  };

  this.suc(cb, 'inner');

  if (!this.expectT(CH_RCURLY))
    this.err('block.dependent.is.unfinished',{tn:n, extra:{delim:'}'}});

  return n;
};
