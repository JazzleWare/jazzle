Emitters['#Untransformed'] = function(n, prec, flags) {
  return UntransformedEmitters[n.kind].call(this, n, prec, flags);
};
