  import {CH_EQUALITY_SIGN} from '../other/constants.js';
  import {TK_OP_ASSIG, PREC_BIT_XOR, TK_SIMP_BINARY} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.readOp_xor =
function() {
  var c = this.c; c++; // '^'
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '^=';
  }
  else {
    this.prec = PREC_BIT_XOR;
    this.lttype = TK_SIMP_BINARY;
    this.ltraw = '^';
  }

  this.setsimpoff(c);
};


