UntransformedEmitters['tzchk'] =
function(n, flags, isStmt) {
  var hasParen = false;
  if (!isStmt)
    hasParen = n.li ? flags & (EC_NON_SEQ|EC_EXPR_HEAD ) :
      flags & EC_NEW_HEAD;
  
  if (hasParen) { this.w('('); flags = EC_NONE; }
  if (n.liq === null) { this.jz('tz').w('(').writeString(n.target.name,"'"); this.w(')'); }
  else ASSERT.call(this, false,  'l');
};
