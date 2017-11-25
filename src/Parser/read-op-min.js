  import {CH_MIN, CH_EQUALITY_SIGN} from '../other/constants.js';
  import {TK_AA_MM, TK_OP_ASSIG, TK_UNBIN} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.readOp_min =
function() {
  var c = this.c; c++; // '-'
  var ch = this.scat(c);
  if (ch === CH_MIN) {
    c++;
    this.lttype = TK_AA_MM;
    this.ltraw = '--';
  }
  else if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '-=';
  }
  else {
    this.lttype = TK_UNBIN;
    this.ltraw = '-';
  }

  this.setsimpoff(c);
};


