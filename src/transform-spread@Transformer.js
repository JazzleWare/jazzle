transform['SpreadElement'] = function(n, pushTarget, isVal) {
  n.argument = this.transform(n.argument, pushTarget, isVal);
  return n;
};
