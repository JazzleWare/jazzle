  import {CH_ADD, CH_EQUALITY_SIGN} from '../other/constants.js';
  import {TK_AA_MM, TK_OP_ASSIG, TK_UNBIN} from '../other/lexer-constants.js';
  import {cls} from './ctor.js';

cls.readOp_add =
function() {
  var c = this.c; c++ // '+'
  var ch = this.scat(c);
  if (ch === CH_ADD) {
    c++;
    this.lttype = TK_AA_MM;
    this.ltraw = '++';
  }
  else if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '+=';
  }
  else {
    this.lttype = TK_UNBIN;
    this.ltraw = '+';
  }

  this.setsimpoff(c);
};


