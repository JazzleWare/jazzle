  import {CH_EQUALITY_SIGN, CH_GREATER_THAN} from '../other/constants.js';
  import {TK_SIMP_BINARY, PREC_EQ, TK_SIMP_ASSIG} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.readOp_eq =
function() {
  var c = this.c; c++; // '='
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    this.lttype = TK_SIMP_BINARY;
    c++; this.prec = PREC_EQ;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.ltraw = '===';
    }
    else this.ltraw = '==';
  }
  else if (ch === CH_GREATER_THAN) {
    this.lttype = TK_SIMP_ASSIG;
    c++;
    this.ltraw = '=>';
  }
  else {
    this.lttype = TK_SIMP_ASSIG;
    this.ltraw = '=';
  }

  this.setsimpoff(c);
};


