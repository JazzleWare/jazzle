transform['FunctionExpression'] =
transform['FunctionDeclaration'] = function(n, pushTarget, isVal) {
  if (functionHasNonSimpleParams(n))
    n.body = this.addParamAssigPrologueToBody(n);

  if (n.generator)
    return this.transformGenerator(n, null, isVal);

  n.body = this.transform(n.body, null, isVal);
  return n;
};

this.addParamAssigPrologueToBody = function(fn) {
  var prolog = {
    type: 'ArgsPrologue',
    left: fn.params,
    right: synth_jz_arguments_to_array(),
  };

  // TODO: make it more low-power
  fn.body.body = [prolog].concat(fn.body.body);

  return fn.body;
};
