  import {TK_SIMP_BINARY, TK_AA_MM, TK_UNBIN, PREC_ADD, TK_OP_ASSIG, PREC_MUL, TK_ID, PREC_COMP, PREC_COND} from '../other/lexer-constants.js';
  import {CH_DIV, CH_EQUALITY_SIGN, CTX_FOR, CH_QUESTION} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.getOp = 
function(ctx) {
  switch ( this. lttype ) {
  case TK_SIMP_BINARY:
  case TK_AA_MM:
    return true;
  case TK_UNBIN:
    this.prec = PREC_ADD;
    return true;
  case CH_DIV:
    if (this.scat(this.c) === CH_EQUALITY_SIGN) {
      this.lttype = TK_OP_ASSIG;
      this.ltraw = '/=';
      this.setsimpoff(this.c+1);
    }
    else {
      this.lttype = TK_SIMP_BINARY; // unnecessary
      this.ltraw = '/';
      this.prec = PREC_MUL; 
    }
    return true;

  case TK_ID:
    switch (this.ltval) {
    case 'in':
      this.resvchk();
    case 'of':
      if (ctx & CTX_FOR) break;

      this.prec = PREC_COMP;
      this.ltraw = this.ltval;
      return true;

    case 'instanceof':
      this.resvchk();
      this.prec = PREC_COMP;
      this.ltraw = this.ltval ;
      return true;
    }
    return false;

  case CH_QUESTION:
    this.prec = PREC_COND;
    return true;

  default: return false;
  }

};


