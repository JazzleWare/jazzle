Emitters['#ForInStatementWithDeclarationHead' ] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  return this.emitEnumeration(n, flags, 'dh');
};


Emitters['#ForInStatementWithExHead' ] =  
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  return this.emitEnumeration(n, flags, 'eh');
};


this.emitEnumeration =
function(n, flags, t) {
  var b = t === 'dh';
  var l = n.left;
  this.w('for').os().w('(');

  if (b) {
    if (l.target.isLLINOSA()) {
      this.w('(').emitRName_binding(l);
      this.wm('','=','','{','v');
      this.os().wm(':','void',' ','0','}',')','.','v').bs();
    }
    else {
      this.w('var').bs().emitRName_binding(l);
      this.bs();
    }
  }
  else if (l.type === 'MemberExpression') {
    this.emitSAT(l, EC_NONE);
    this.os();
  }
  else {
    this.emitAny(l, EC_NONE, false);
    this.bs();
  }

  this.wt('in',ETK_ID );
  this.gu(wcb_idNumGuard );
  this.os();

  this.emitAny(n.right, EC_NONE, false);
  this.w(')');

  this.emitAttached(n.body);
};
