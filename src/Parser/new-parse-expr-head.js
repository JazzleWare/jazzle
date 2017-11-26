  import {TK_ID, TK_NUM, TK_UNBIN, PREC_UNARY} from '../other/lexer-constants.js';
  import {CH_LSQBRACKET, CH_LPAREN, CH_LCURLY, CH_MULTI_QUOTE, CH_SINGLE_QUOTE, CH_DIV, CH_BACKTICK} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.parseExprHead =
function(ctx) {
  var head = this.exprHead;
  if (head !== null) this.exprHead = null;
  else
  switch (this.lttype) {
  case TK_ID:
    if (head = this.parseIDExprHead(ctx))
      break;

    // the head is not an id-statement,
    // but it is not an id-expr either.
    // this is actually the case for
    // void, typeof, yield, delete, and await
    return null;

  case CH_LSQBRACKET:
    head = this.parseArray(ctx);
    break;

  case CH_LPAREN:
    head = this.parseParen(ctx);
    break;

  case CH_LCURLY:
    head = this.parseObj(ctx);
    break;

  case CH_MULTI_QUOTE:
  case CH_SINGLE_QUOTE:
    head = this.parseString(this.lttype);
    break;

  case TK_NUM:
    head = this.getLit_num();
    break;

  case CH_DIV:
    head = this.parseRegexLiteral();
    break;

  case CH_BACKTICK:
    head = this.parseTemplate();
    break;

  case TK_UNBIN:
    this.prec = PREC_UNARY;
    return null;

  default: return null;
  }

  return head;
};


