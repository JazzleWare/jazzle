Transformers['ReturnStatement'] =
function(n, isVal) {
  // TODO: try { return 'a' /* <-- this */ } finally { yield 'b' }
  n.argument = this.tr(n.argument, true);
  return n;
};
