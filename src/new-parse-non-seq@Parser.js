this.parseNonSeqExpr =
function(prec, ctx) {
  var head = this.exprHead;
  if (head) this.exprHead = null;
  else head = this.parseExprHead(ctx);

  if (head === null)
  switch (this.lttype) {
  case TK_UNARY:
  case TK_UNBIN:
    head = this.parseUnaryExpression(ctx);
    break;

  case TK_AA_MM:
    head = this.parseUpdateExpression(null, ctx);
    break;

  case TK_YIELD:
    if (prec !== PREC_NONE)
      this.err('yield.as.an.id');
    return this.parseYield(ctx);

  default:
    if (!(ctx&CTX_NULLABLE))
      this.err('nexpr.null.head');
    return null;
  }

  var hasOp = this.getOp(ctx);
  if (!hasOp) {
    if (mnl(ctx)) {
      this.flushSimpleErrors();
      this.dissolveParen();
    }
    return head;
  }

  if (this.lttype & TK_ANY_ASSIG) {
    if (prec !== PREC_NONE)
      this.err('assig.not.first');
    return this.parseAssignment(head, ctx);
  }

  if (mnl(ctx)) {
    this.flushSimpleErrors();
    this.dissolveParen();
  }

  if (this.lttype === CH_QUESTION)
    return prec === PREC_NONE ?
      this.parseCond(head, ctx) : head;

  if (this.lttype === TK_AAMM) {
    if (this.nl)
      return head;
    return this.parseUpdateExpression(head, ctx);
  }

  do {
    var curPrec = this.prec;
    if (prec === PREC_U && curPrec === PREC_EX)
      this.err('unary.before.an.exponentiation');
    if (curPrec < prec)
      break;
    if (curPrec === prec && !isRA(prec))
      break;

    var o = this.ltraw;
    this.next();
    var r = this.parseNonSeqExpr(curPrec, ctx & CTX_FOR);
    head = {
      type: isLog(curPrec) ? 'LogicalExpression' : 'BinaryExpression',
      operator: o,
      start: head.start,
      end: right.end,
      loc: {
        start: head.loc.start,
        end: right.loc.end },
      left: core(head),
      right: core(right)
    };
  } while (hasOp = this.getOp(ctx));

  return head;
};
