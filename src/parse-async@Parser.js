function idAsync(c0,li0,col0,raw) {
  return {
    type: 'Identifier', name: 'async',
    start: c0, end: c0 + raw.length,
    loc: {
      start: { line: li0, column: col0 }, 
      end: { line: li0, column: col0 + raw.length }
    }, raw: raw
  };
}

this.parseAsync = function(context) {
  if (this.v < 7) 
    return this.id();

  var c0 = this.c0,
      li0 = this.li0,
      col0 = this.col0,
      raw = this.ltraw;

  var stmt = this.canBeStatement;
  if (stmt)
    this.canBeStatement = false;

  this.next();

  var n = null;
  switch (this.lttype) {
  case 'Identifier':
    if (this.nl) {
      if ((context & CTX_ASYNC_NO_NEWLINE_FN) &&
         this.ltval === 'function')
        n = null;
      else
        n = idAsync(c0,li0,col0,raw);
      break;
    }
    if (this.ltval === 'function') {
      // TODO: eliminate
      if (stmt) {
        this.canBeStatement = stmt;
        if (this.unsatisfiedLabel)
          this.err('async.label.not.allowed',{c0:c0,li0:li0,col0:col0});
        if (this.scope.isBare())
          this.err('async.is.not.allowed',{c0:c0,li0:li0,col0:col0});

        stmt = false;
      }

      n = this.parseFunc(context, ST_ASYNC);
      n.start = c0;
      n.loc.start.line = li0;
      n.loc.start.column = col0;
      break;
    }
    if (context & CTX_ASYNC_NO_NEWLINE_FN) {
      n = null;
      break;
    }
    n = this.parseAsync_intermediate(c0,li0,col0);
    this.st = ERR_INTERMEDIATE_ASYNC;
    this.se = n;
    break;

  case '(':
    if (context & CTX_ASYNC_NO_NEWLINE_FN) {
      n = null;
      break; 
    }
    var hasNewLineBeforeParen = this.nl;
    var args = this.parseParen(context & CTX_PAT), async = idAsync(c0,li0,col0,raw);
    n = {
      type: 'CallExpression', callee: async,
      start: c0, end: args.end,
      loc: {
        start: async.loc.start,
        end: args.loc.end
      }, arguments: args.expr ?
        args.expr.type === 'SequenceExpression' ?
          args.expr.expressions :
          [args.expr] :
        []
    };
    
    if ((context & CTX_PAT) && hasNewLineBeforeParen) {
      this.pt = ERR_ASYNC_NEWLINE_BEFORE_PAREN;
      this.pe = n;
    }

    break;

  default:
    if (context & CTX_ASYNC_NO_NEWLINE_FN)
      n = null;
    else
      n = idAsync(c0,li0,col0,raw);
    break;
  }

  if (stmt)
    this.canBeStatement = stmt;

  return n;
};

this.parseAsync_intermediate = function(c0, li0, col0) {
  var id = this.validateID("");
  return {
    type: INTERMEDIATE_ASYNC,
    id: id,
    start: c0,
    loc: { 
      start: { line: li0, column: col0 }
    }
  };
};

