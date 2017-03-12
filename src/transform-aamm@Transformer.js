transform['UpdateExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n.argument))
    n.argument = this.transform(n.argument, pushTarget, true);
  else
    n.argument = this.transform(n.argument, null, true);
  return n;
};
