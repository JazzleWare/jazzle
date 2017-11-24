  import {UntransformedEmitters} from '../other/globals.js';
  import {ASSERT_EQ} from '../other/constants.js';
  import {cls} from './cls.js';

UntransformedEmitters['llinosa-names'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var scope = n.scope, hasV = n.withV, list = scope.defs, em = 0;
  var l = 0, len = list.length();

  while (l < len) {
    var item = list.at(l++);
    if (item.isLLINOSA()) {
      em ? this.w(',').os() : this.w('var').bs();
      this.w(item.synthName);
      hasV && this.os().wm('=','','{','v',':','','void',' ','0','}');
      ++ em;
    }
  }

  em && this.w(';').l(); // TODO onw(wcb_afterStmt) rather than l
};

