  import {PREC_NONE, TK_ELLIPSIS} from '../other/lexer-constants.js';
  import {CTX_NULLABLE, CTX_TOP, CTX_NONE, CH_COMMA} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {cls} from './cls.js';

cls.parseArgList = function () {
  var c0 = -1, li0 = -1, col0 = -1, parenAsync = this.parenAsync,
      elem = null, list = [];

  var y = 0;

  var argloc = this.loc0();
  do { 
    this.next();
    elem = this.parseNonSeq(PREC_NONE, CTX_NULLABLE|CTX_TOP); 
    if (elem)
      list.push(core(elem));
    else if (this.lttype === TK_ELLIPSIS)
      list.push(elem = this.parseSpread(CTX_NONE));
    else {
      if (list.length !== 0) {
        if (this.v < 7)
          this.err('arg.non.tail',
            {c0:c0, li0:li0, col0:col0,
            extra: {list: list, async: parenAsync}});
      }
      break;
    }

    y += this.Y(elem);
    this.spc(core(elem), 'aft');

    if (this.lttype === CH_COMMA) {
      c0 = this.c0;
      li0 = this.li0;
      col0 = this.col0;
    }
    else break;
  } while (true);

  if (parenAsync !== null)
    this.parenAsync = parenAsync;

  this.yc= y;
  this.argploc = argloc;

  return list ;
};


