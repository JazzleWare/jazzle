  import {CH_EQUALITY_SIGN, CH_OR} from '../other/constants.js';
  import {TK_OP_ASSIG, TK_SIMP_BINARY, PREC_LOG_OR, PREC_BIT_OR} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.readOp_or =
function() {
  var c = this.c; c++; // '|'
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '|=';
  }
  else {
    this.lttype = TK_SIMP_BINARY;
    if (ch === CH_OR) {
      c++; this.prec = PREC_LOG_OR;
      this.ltraw = '||';
    }
    else {
      this.prec = PREC_BIT_OR;
      this.ltraw = '|';
    }
  }

  this.setsimpoff(c);
};


