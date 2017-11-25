  import {UntransformedEmitters} from '../other/globals.js';
  import {ASSERT, EC_NONE, ASSERT_EQ} from '../other/constants.js';

UntransformedEmitters['cls'] =
function(n, flags, isStmt) {
  this.jz('cls').w('(');
  if (n.cls) {
    ASSERT.call(this, n.target === null, 'cls' ); 
    this.eN(n.cls, EC_NONE, false);     
  }
  else this.w(n.target.synthName);
  n.heritage && this.w(',').os().eN(n.heritage);
  this.w(')');
  isStmt && this.w(';');
};

UntransformedEmitters['cls-assig'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var ll = n.target.isLLINOSA();
  ll || this.w('var').bs();
  this.w(n.target.synthName);
  ll && this.wm('.','v');
  this.wm('','=','').eN(n.ctor, EC_NONE, false);
  this.w(';');
};

