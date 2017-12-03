  import {ERR_NONE_YET, ERR_PIN_UNICODE_IN_RESV} from '../other/error-constants.js';
  import {isIDHead} from '../other/ctype.js';
  import {cp2sp} from '../other/util.js';
  import {cls} from './cls.js';

cls.readID_bs =
function() {
  if (this.ct === ERR_NONE_YET) {
    this.ct = ERR_PIN_UNICODE_IN_RESV;
    this.pin_ct(this.c,this.li,this.col);
  }
  var bsc = this.readBS();
  var ccode = bsc;
  if (bsc >= 0x0D800 && bsc <= 0x0DBFF)
    this.err('id.head.is.surrogate');
  else if (!isIDHead(bsc))
    this.err('id.head.esc.not.idstart');

  var head = cp2sp(bsc);
  return this.readID_withHead(head);
};


