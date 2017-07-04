this.parseUpdate = function(arg, ctx) {
  var c = 0, loc = null, u = this.ltraw;
  if (arg === null) {
    c = this.c0;
    loc = this.loc0();
    this.next() ;
    arg = this.parseExprHead(ctx & CTX_FOR);
    if (arg === null)
      this.err('unexpected.lookahead');

    arg = this.parseTail(arg);
    if (!this.ensureSAT(core(arg)))
      this.err('incdec.pre.not.simple.assig',{tn:core(arg)});

    return {
      type: 'UpdateExpression', operator: u,
      start: c, end: arg.end, argument: core(arg),
      loc: { start: loc, end: arg.loc.end },
      prefix: true, '#y': this.Y(arg)
    };
  }

  if (!this.ensureSAT(core(arg)))
    this.err('incdec.post.not.simple.assig',{tn:core(arg)});

  c  = this.c;
  loc = {
    start: arg.loc.start,
    end: { line: this.li, column: this.col }
  };
  this.next() ;
  return {
    type: 'UpdateExpression', operator: u,
    start: arg.start, end: c,
    argument: core(arg), loc: loc,
    prefix: false, '#y': this.Y(arg)
  };
};
