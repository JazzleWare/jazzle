  import {CH_LCURLY, CH_SEMI, CTX_PAT, CH_SINGLE_QUOTE, CH_MULTI_QUOTE, CTX_NULLABLE, CTX_TOP, CH_COLON} from '../other/constants.js';
  import {TK_ID, TK_EOF} from '../other/lexer-constants.js';
  import {isDirective, core} from '../other/util.js';
  import {cls} from './cls.js';

cls.parseStatement =
function(allowNull) {
  var head = null;
  switch (this.lttype) {
  case CH_LCURLY:
    head = this.parseBlock();
    break;
  case CH_SEMI:
    head = this.parseEmptyStatement();
    break;
  case TK_ID:
    this.canBeStatement = true;
    // TODO: CTX.PAT|CTX.NO_SIMP
    head = this.parseIDExprHead(CTX_PAT);
    if (!this.foundStatement) {
      this.canBeStatement = false;
      this.exprHead = head;
      head = null;
    }
    break;

  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    if (this.scope.insidePrologue())
      this.chkDirective = true;
    this.exprHead = this.parseString(this.lttype);
    break;

  case TK_EOF:
    if (!allowNull)
      this.err('stmt.null');
    break;
  }

  var finishPrologue = this.scope.insidePrologue();
  if (this.foundStatement) {
    if (head === null)
      allowNull || this.err('stmt.null');
    this.foundStatement = false;
  }
  else if (head === null) {
    head = this.parseExpr(CTX_NULLABLE|CTX_TOP);
    if (head === null)
      allowNull || this.err('stmt.null');
    else if (head.type === 'Identifier' &&
      this.lttype === CH_COLON)
      head = this.parseLabel(head, allowNull);
    else {
      this.fixupLabels(false);
      if (finishPrologue && isDirective(head)) {
        finishPrologue = false;
        this.applyDirective(head);
      }
      this.semi(core(head)['#c'], 'aft') || this.err('no.semi');
      head = {
        type: 'ExpressionStatement',
        expression: core(head),
        start: head.start,
        end: this.semiC || head.end,
        loc: {
          start: head.loc.start,
          end: this.semiLoc || head.loc.end },
        '#y': this.Y(head), '#c': {}
      };
    }
  }

  if (finishPrologue)
    this.scope.exitPrologue();

  return head;
};


