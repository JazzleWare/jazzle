  import {Emitters} from '../other/globals.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {cls} from './cls.js';

Emitters['LabeledStatement'] =
function(n, flags, isStmt) {
  this.writeIDName(n.label.name);
  this.w(':').gu(wcb_afterStmt);
  var own = {used: false};
  this.gmon(own);
  if (n.body) this.emitStmt(n.body);

  own.used || this.grmif(own);
};

