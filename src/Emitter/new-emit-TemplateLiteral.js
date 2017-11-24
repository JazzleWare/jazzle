  import {Emitters} from '../other/globals.js';
  import {EC_NONE} from '../other/constants.js';
  import {cls} from './cls.js';

Emitters['TemplateLiteral'] =
function(n, flags, isStmt) {
  var strList = n.quasis;
  var eList = n.expressions;
  var s = 0, writeEx = false, e = 0;

  if (strList[0].value.cooked.length === 0 && !strList[0].tail) {
    s++;
    writeEx = true;
  }

  this.w('('); // TODO: eliminate when the TemplateLiteral gets treated like an actual ex + str + ... + ex + str
  while (true) {
    if (writeEx) {
      this.w('(').eA(eList[e++], EC_NONE, false).w(')');
      this.wm('', '+').os();
      writeEx = false;
    } 
    else {
      var item = strList[s++ ];
      this.writeString(item.value.cooked, "'");
      if (!item.tail)
        this.wm('','+','');
      else
        break;
      writeEx = true;
    }
  }

  this.w(')');

  isStmt && this.w(';');
};

