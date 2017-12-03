  import {UntransformedEmitters} from '../other/globals.js';
  import {EC_NON_SEQ, EC_EXPR_HEAD, EC_NEW_HEAD, EC_NONE, ASSERT} from '../other/constants.js';

UntransformedEmitters['tzchk'] =
function(n, flags, isStmt) {
  var hasParen = false;
  if (!isStmt)
    hasParen = n.li ? flags & (EC_NON_SEQ|EC_EXPR_HEAD ) :
      flags & EC_NEW_HEAD;
  
  if (hasParen) { this.w('('); flags = EC_NONE; }
  if (n.liq === null) { this.jz('tz').w('(').writeString(n.target.name,"'"); this.w(')'); }
  else ASSERT.call(this, false,  'l');

  isStmt && this.w(';');
};

UntransformedEmitters['tzcheckpoint'] =
function(n, flags, isStmt) {
  ASSERT.call(this, n.scope.hasTZCheckPoint, 'could not find a tzcheckpoint');
  this.w(n.scope.scs.getLG('tz').getL(0).synthName).wm('','=').wm('',n.scope.di0+"");
  isStmt && this.w(';');
};
