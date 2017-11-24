  import {Emitters} from '../other/globals.js';
  import {ASSERT_EQ, ETK_ID, EC_NONE, EC_START_STMT, EC_ATTACHED} from '../other/constants.js';
  import {CB, isAssigList} from '../other/util.js';
  import {wcb_afterElse, wcb_afterStmt} from '../other/wcb.js';
  import {cls} from './cls.js';

Emitters['IfStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('if', ETK_ID).emc(cb, 'aft.if');
  this.wm('','(').eA(n.test, EC_NONE, false).w(')');

  this.emitIfBody(n.consequent);
  if (n.alternate)
    this.l().wt('else', ETK_ID).gu(wcb_afterElse).emitElseBody(n.alternate);

  this.emc(cb, 'aft');

  return true;
};

this.emitIfBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.os();
  case 'EmptyStatement':
    return this.emitStmt(stmt);
  }
  if (stmt.type === 'ExpressionStatement') {
    if (isAssigList(stmt.expression))
      this.os().emitAny(stmt.expression, EC_START_STMT|EC_ATTACHED, true);
    else {
      this.i();
      this.l().emitStmt(stmt);
      this.u();
    }
    return true;
  }
  var own = {used: false};
  this.os().w('{').i().gu(wcb_afterStmt).gmon(own);
  this.emitStmt(stmt); // not attached -- the '{' block is, instead.
  if (this.guard) this.grmif(own);
  else { this.gu(wcb_afterStmt); }
  this.u().w('}');
};

this.emitElseBody =
function(stmt) {
  return stmt.type === 'IfStatement' ?
    this.emitStmt(stmt) :
    this.emitAttached(stmt);
};

