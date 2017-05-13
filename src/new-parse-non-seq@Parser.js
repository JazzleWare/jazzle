this.parseNonSeq =
function(prec, ctx) {
  var head = this.exprHead;
  if (head) this.exprHead = null;
  else head = this.parseExprHead(ctx);

  if (head)
    head = this.parseTail(head);
  else
  switch (this.lttype) {
  case TK_UNARY:
  case TK_UNBIN:
    head = this.parseUnary(ctx);
    break;

  case TK_AA_MM:
    head = this.parseUpdate(null, ctx);
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
  if (this.lttype & TK_ANY_ASSIG) {
    if (prec !== PREC_NONE)
      this.err('assig.not.first');
    return this.parseAssignment(head, ctx);
  }

  if (errt_pat(ctx)) {
    // alternatively, head.type === NPAREN
    if (this.parenScope) {
      this.st_flush();
      this.dissolveParen();
    }
    else if (hasOp || errt_noLeak(ctx))
      this.st_flush();
  }

  while (hasOp) {
    if (this.lttype === TK_AA_MM) {
      if (!this.nl) {
        head = this.parseUpdate(head, ctx);
        hasOp = this.getOp(ctx);
        continue;
      }
      else break;
    }

    if (this.lttype === CH_QUESTION) {
      if (prec === PREC_NONE)
        head = this.parseCond(head, ctx);
      break;
    }

    var curPrec = this.prec;
    if (prec === PREC_UNARY && curPrec === PREC_EX)
      this.err('unary.before.an.exponentiation');
    if (curPrec < prec)
      break;
    if (curPrec === prec && !isRA(prec))
      break;

    var o = this.ltraw;
    this.next();
    var r = this.parseNonSeq(curPrec, ctx & CTX_FOR);
    head = {
      type: isLog(curPrec) ? 'LogicalExpression' : 'BinaryExpression',
      operator: o,
      start: head.start,
      end: r.end,
      loc: {
        start: head.loc.start,
        end: r.loc.end },
      left: core(head),
      right: core(r)
    };

    hasOp = this.getOp(ctx);
  }

  return head;
};
