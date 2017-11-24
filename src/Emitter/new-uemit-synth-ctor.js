  import {UntransformedEmitters} from '../other/globals.js';
  import {ASSERT_EQ, ETK_ID} from '../other/constants.js';
  import {wcb_afterRet} from '../other/wcb.js';
  import {cls} from './cls.js';

UntransformedEmitters['synthc'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false ) ;
  var s = 's';
  if (n.heritage) {
    var base = 's', num = 0;
    if (n.name) {
      var name = n.name.name;
      while (name === s)
        s = base + (++num);
    }  
    this.wt('function',ETK_ID).wm('(',s,')','','{','','return').onw(wcb_afterRet,{hasParen: false});
    var obj = this.wcbp;
    this.wt('function',ETK_ID);
    if (n.name) this.wm(' ',n.name.name);
    this.wm('(',')','','{','', s,'.','apply','(',
      'this',',','arguments',')',';','','}');
    obj.hasParen && this.w(')')
    this.wm(';','','}','(').eN(n.heritage).w(')');

  } else {
    this.w('function');
    if (n.name) this.wm(' ',n.name.name);
    this.wm('(',')','','{','}');
  }
};

