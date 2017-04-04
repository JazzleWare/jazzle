this.synth_SubAssig = 
function(left, right, isInitializer) {
  return {
    type: isInitializer ? '#DeclAssig' : '#SubAssig',
    left: left,
    right: right,
    operator: '=',
    y: -1 
  };
};

this.synth_ObjIter =
function(expr) {
  return {
    type: '#Untransformed',
    kind: 'obj-iter',
    iterExpr: expr
  };
};

this.synth_ObjIterGet =
function(iter, keyName, isComputed) {
  return {
    type: '#Untransformed',
    kind: 'obj-iter-get',
    keyName: keyName,
    iter: iter,
    computed: isComputed
  };
};

this.synth_ObjIterVal = function(iter) {
  return {
    type: '#Untransformed',
    iter: iter,
    kind: 'obj-iter-val'
  };
};

this.synth_ResolvedName = function(name, decl, shouldTest) {
  return { 
    type: '#ResolvedName', decl: decl, name: name, shouldTest: shouldTest, constCheck: false
  };
};

this.synth_Sequence = function(list) {
  return {
    type: '#Sequence',
    elements: list,
    y: -1
  };
};

this.synth_TempSave = function(temp, expr) {
  return {
    left: temp,
    right: expr,
    kind: 'temp-save',
    type: '#Untransformed'
  };
};

this.synth_Cond = function(test, consequent, alternate) {
  return {
    type: 'ConditionalExpression',
    test: test,
    consequent: consequent,
    alternate: alternate,
    y: -1
  };
};

this.synth_ArrIterEnd = function(iter) {
  return {
    type: '#Untransformed',
    kind: 'arr-iter-end',
    iter: iter
  };
};

this.synth_ArrIter = function(expr) {
  return {
    type: '#Untransformed',
    kind: 'arr-iter',
    iterExpr: expr
  };
};

this.synth_UoN = function(expr) {
  return {
    type: '#Untransformed',
    kind: 'uon',
    argument: expr
  };
};

this.synth_ArrIterGet = function(iter, isRest) {
  return {
    type: '#Untransformed',
    kind: 'arr-iter-get',
    iter: iter,
    rest: isRest ? true : false
  };
};

this.synth_DeclAssig = function(left, right) {
  return this.synth_SubAssig(left, right, true);
};

this.synth_ConstCheck = function(n) {
  return {
    type: '#Untransformed',
    kind: 'const-check',
    assigner: n
  }
};

this.synth_ArgAssig = function(paramList) {
  return {
    type: '#ArgAssig',
    elements: paramList
  }
};

this.synth_ArgIter = function() {
  return {
    type: '#Untransformed',
    kind: 'arguments-iter'
  }
};
