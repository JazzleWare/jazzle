  import {CH_EQUALITY_SIGN, CH_LESS_THAN} from '../other/constants.js';
  import {PREC_COMP, TK_SIMP_BINARY, TK_OP_ASSIG, PREC_SH} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

this.readOp_lt =
function() {
  var c = this.c; c++; // '<'
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_COMP;
    this.lttype = TK_SIMP_BINARY;
    this.ltraw = '<=';
  }
  else if (ch === CH_LESS_THAN) {
    c++;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.lttype = TK_OP_ASSIG;
      this.ltraw = '<<=';
    }
    else {
      this.lttype = TK_SIMP_BINARY;
      this.prec = PREC_SH;
      this.ltraw = '<<';
    }
  }
  else {
    this.lttype = TK_SIMP_BINARY;
    this.prec = PREC_COMP;
    this.ltraw = '<';
  }

  this.setsimpoff(c);
};

