transform['ClassExpression'] =
transform['ClassDeclaration'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return transformClassWithYield(n, pushTarget, isVal);

  return n;
};
