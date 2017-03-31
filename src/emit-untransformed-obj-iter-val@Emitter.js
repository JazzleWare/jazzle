UntransformedEmitters['obj-iter-val'] = function(n, prec, flags) {
  var zero = flags & EC_CALL_HEAD;
  zero && this.wm('(','0',',');
  this.eN(n.iter).wm('.','val');
  zero && this.w(')');
};
