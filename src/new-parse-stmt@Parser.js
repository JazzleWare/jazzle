this.parseStatement =
function(allowNull) {
  var head = null;
  switch (this.lttype) {
  case CH_LCURLY:
    return this.parseBlockStatement();
  case CH_SEMI:
    return this.parseEmptyStatement();
  case TK_ID:
    this.canBeStatement = true;
    // TODO: CTX.PAT|CTX.NO_SIMP
    head = this.parseIdExprHead(CTX_PAT);
    if (this.foundStatement) {
      this.foundStatement = false;
      return head;
    }
    this.canBeStatement = false;
    this.exprHead = head;
    break;

  case TK_EOF:
    if (!allowNull)
      this.err('stmt.null');
    return null;
  }

  head = this.parseExpr(CTX_TOP);
  if (head === null) {
    allowNull && this.err('stmt.null');
    return null;
  }
  if (head.type === 'Identifier' &&
    this.lttype === CH_COLON)
    return this.parseLabeledStatement(
      head, allowNull);

  this.fixupLabels(false);
  if (!this.semi())
    this.err('no.semi');

  return {
    type: 'ExpressionStatement',
    expression: core(head),
    start: head.start,
    end: this.semiC || head.end,
    loc: {
      start: head.loc.start,
      end: this.semiLoc || head.loc.end }
  };
};

//if (this.insidePrologue()) {
//  if (!isDirective(head))
//    this.exitPrologue();
//  else
//    this.applyDirective(head);
//}
