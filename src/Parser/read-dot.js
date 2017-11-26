  import {CH_SINGLEDOT} from '../other/constants.js';
  import {isNum} from '../other/ctype.js';
  import {FL_HEADLESS_FLOAT, TK_NUM} from '../other/lexer-constants.js';
  import {cls} from './ctor.js';

cls.read_dot =
function() {
  var ch = this.scat(this.c+1);
  if (ch === CH_SINGLEDOT)
    return this.read_ellipsis();
  
  if (isNum(ch)) {
    this.readNum_tail(FL_HEADLESS_FLOAT);
    this.ltval = parseFloat(this.ltraw = this.c0_to_c());
    this.lttype = TK_NUM;
  }
  else {
    this.setsimpoff(this.c+1);
    this.lttype = CH_SINGLEDOT;
  }
};


