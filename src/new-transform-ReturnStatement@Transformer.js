Transformers['ReturnStatement'] =
function(n, isVal) {
  // TODO: try { return 'a' /* <-- this */ } finally { yield 'b' }
  if (n.argument)
    n.argument = this.tr(n.argument, true);
  return n;
};
