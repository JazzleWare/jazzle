transform['UpdateExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n.argument))
    n.argument = this.transform(n.argument, pushTarget, true);
  else {
    n.argument = this.transform(n.argument, null, true);
    var arg = n.argument;
    if (arg.type === '#ResolvedName' && arg.shouldTest) {
      arg.alternate = n;
      n = arg;
    }
  }
  return n;
};
