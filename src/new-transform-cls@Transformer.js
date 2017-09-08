Transformers['ClassExpression'] =
function(n, isVal) {
  return this.transformClsExpr(n, isVal);
};

Transformers['ClassDeclaration'] =
function(n, isVal) {
  var target = this.cur.findDeclOwn_m(_m(n.id.name));
  var classToItself = n['#scope'].findRefU_m(_m(n.id.name));
  if (classToItself) {
    ASSERT.call(this, classToItself.getDecl() === target, 'class');
    if (classToItself.d === target.ref.d &&
      classToItself.i === target.ref.i)
      return this.transformClsExpr(n, isVal);
  }
  n = this.transformClsBinding(n, isVal);
  n.target = target;

  return n;
};
