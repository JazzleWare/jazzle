  import {EC_START_STMT, EC_NEW_HEAD, EC_NONE, ETK_ID} from '../other/constants.js';
  import {wcb_afterVar, wcb_afterRet} from '../other/wcb.js';
  import {cls} from './ctor.js';

cls.emitExprFn =
function(n, flags, isStmt) {
  var hasParen = flags & EC_START_STMT;
  var raw = n.fun;
  var scope = raw['#scope'];
  var scopeName = scope.scopeName;
  var lonll = scope.getNonLocalLoopLexicals();
  var isRenamed = scopeName && scopeName.name !== scopeName.synthName;
  var hasWrapper = n.cls || n.scall || lonll || isRenamed;
  var em = 0;
  if (hasWrapper) {
    if (!hasParen)
      hasParen = flags & EC_NEW_HEAD;
  }

  var l = {hasParen: false };

  if (hasParen) { this.w('('); flags = EC_NONE; }
  if (hasWrapper) {
    this.wt('function', ETK_ID).w('(');
    if (n.scall) { this.w(n.scall.inner.synthName); em++; }
    if (n.cls) { em && this.w(',').os(); this.w(n.cls.inner.synthName); em++; }
    if (lonll) { em && this.w(',').os(); this.wsndl(lonll); }
    this.w(')').os().w('{').i().l();
    if (isRenamed)
      this.w('var').gu(wcb_afterVar).wt(scopeName.synthName, ETK_ID).wm('','=','');
    else
      this.w('return').gu(wcb_afterRet).gar(l);
  }
  this.emitTransformedFn(n);
  if (l.hasParen) this.w(')');
  if (hasWrapper) {
    this.w(';');
    if (isRenamed) {
      this.l().w('return').gu(wcb_afterRet).gar(l).wt(scopeName.synthName, ETK_ID);
      if (l.hasParen) this.w(')');
      this.w(';');
    }
    this.u().l().wm('}','(');
    em = 0;
    if (n.scall) { this.eN(n.scall.outer, EC_NONE, false); em++; }
    if (n.cls) { em && this.w(',').os(); this.eN(n.cls.outer, EC_NONE, false); em++; }
    if (lonll) { em && this.w(',').os(); this.wsndl(lonll); }
    this.w(')');
  }
  hasParen && this.w(')');
  isStmt && this.w(';');
};


