UntransformedEmitters['obj-iter-get'] = function(n, prec, flags) {
  this.eA(n.iter).wm('.','get','(');
  if (n.computed)
    this.eN(n.keyName);
  else if (n.keyName.type === 'Literal')
    this.eA(n.keyName);
  else {
    ASSERT.call(this, n.keyName.type === 'Identifier',
      'got a key of the type ' + n.keyName.type);
    this.w('\'').writeStrWithVal(n.keyName.name).w('\'');
  }
  this.w(')');
};
