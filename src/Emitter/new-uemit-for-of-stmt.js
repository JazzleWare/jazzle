  import {Emitters} from '../other/globals.js';
  import {EC_NONE} from '../other/constants.js';

Emitters['#ForOfStatement'] =
function(n, flags, isStmt) {
  this.w('for').os().w('(');
  this.eH(n.left, EC_NONE, false).os().w('=').os().jz('of').w('(');
  this.eN(n.right, EC_NONE, false).w(')');

  this.w(';').os();
  var scope = n['#scope'];
  if (scope.hasTZCheckPoint) {
    var tz = scope.scs.getLG('tz').getL(0);
    this.wm(tz.synthName,' ','=',' ',scope.di0+"",',','');
  }
  this.eH(n.left, EC_NONE, false).w('.').wm('next','(',')',';',')');
  this.emitBody(n.body);
};

