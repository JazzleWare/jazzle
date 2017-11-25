  import {CH_SINGLEDOT} from '../other/constants.js';
  import {TK_ELLIPSIS} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.read_ellipsis =
function() {
  var c = this.c+2, s = this.src;
  if (c>=s.length || s.charCodeAt(c) !== CH_SINGLEDOT) {
    this.setsimpoff(c);
    this.err('unexpected.dot');
  }

  this.setsimpoff(c+1);
  this.lttype = TK_ELLIPSIS;
};


