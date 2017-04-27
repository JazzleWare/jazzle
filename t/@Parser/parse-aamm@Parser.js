this.parseUpdateExpression = function(arg, context) {
  var c = 0, loc = null, u = this.ltraw;
  if (arg === null) {
    c = this.c-2;
    loc = this.locOn(2);
    this.next() ;
    arg = this.parseExprHead(context & CTX_FOR);
    if (arg === null)
      this.err('unexpected.lookahead');

    if (!this.ensureSimpAssig_soft(core(arg)))
      this.err('incdec.pre.not.simple.assig',{tn:core(arg)});

    return {
      type: 'UpdateExpression', operator: u,
      start: c, end: arg.end, argument: core(arg),
      loc: { start: loc, end: arg.loc.end },
      prefix: true
    };
  }

  if (!this.ensureSimpAssig_soft(core(arg)))
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
    prefix: false
  };
};
