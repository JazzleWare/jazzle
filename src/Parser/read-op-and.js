  import {CH_EQUALITY_SIGN, CH_AND} from '../other/constants.js';
  import {TK_OP_ASSIG, TK_SIMP_BINARY, PREC_LOG_AND, PREC_BIT_AND} from '../other/lexer-constants.js';
  import {cls} from './ctor.js';

cls.readOp_and = 
function() {
  var c = this.c; c++;
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    c++; this.lttype = TK_OP_ASSIG;
    this.ltraw = '&=';
  }
  else {
    this.lttype = TK_SIMP_BINARY;
    if (ch === CH_AND) {
      c++; this.prec = PREC_LOG_AND;
      this.ltraw = '&&';
    }
    else {
      this.prec = PREC_BIT_AND;
      this.ltraw = '&';
    }
  }

  this.setsimpoff(c);
};


