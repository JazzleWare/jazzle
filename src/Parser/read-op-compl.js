  import {TK_UNARY} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.readOp_compl =
function() {
  this.lttype = TK_UNARY;
  this.ltraw = '~';
  this.setsimpoff(this.c+1);
};


