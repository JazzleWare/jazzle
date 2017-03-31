var assigTransformers = {};

transform['AssignmentExpression'] = 
function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformAssigWithYield(n, pushTarget, isVal);

  ASSERT.call(this, pushTarget === null,
    'pushTarget is not alowed to be non-null');

  pushTarget = [];
  var transformer = assigTransformers[n.left.type];
  var result = transformer.call(this, n, pushTarget, isVal);
  result && pushTarget.push(result);

  return pushTarget.length === 1 ?
    pushTarget[0] : this.synth_Sequence(pushTarget);
};

transform['#SubAssig'] =
function(n, pushTarget, isVal) {
  ASSERT.call(this, !isVal,
    'sub-assignments are not allowed to have values');

  if (this.y(n))
    return this.transformSubAssigWithYield(n, pushTarget, isVal);

  return assigTransformers[n.left.type].call(this, n, pushTarget, isVal);
};

assigTransformers['Identifier'] = function(n, pushTarget, isVal) {
  n.left = this.transform(n.left, null, true);
  n.right = this.transform(n.right, null, true);
  return n;
};

assigTransformers['MemberExpression'] = function(n, pushTarget, isVal) {
  n.left = this.transform(n.left, null, true);
  n.right = this.transform(n.right, null, true);
  return n;
};

assigTransformers['ObjectPattern'] = function(n, pushTarget, isVal) {
  n.right = this.transform(n.right, null, true);

  var temp = this.saveInTemp(this.synth_ObjIter(n.right), pushTarget);
  var list = n.left.properties;
  var e = 0;
  while (e < list.length) {
    var elem = list[e++];
    var result = this.transform(
      this.synth_SubAssig(
        elem.value,
        this.synth_ObjIterGet(temp,
          elem.computed ? this.transform(elem.key, null, true) : elem.key, elem.computed)
      ),
      pushTarget,
      false
    );
    result && pushTarget.push(result);
  }
  this.releaseTemp(temp);
  return isVal ? this.synth_ObjIterVal(temp) : null;
};

assigTransformers['AssignmentPattern'] = function(n, pushTarget, isVal) {
  ASSERT.call(this, !isVal,
    'assignment-patterns are not allowed to have a transform-value');
  var l = n.left.left,
      valDefault = n.left.right,
      r = n.right;
  var temp = this.allocTemp(),
      cond = this.synth_Cond(
        this.synth_UoN(this.synth_TempSave(temp, r)),
        valDefault,
        temp
      );
  this.releaseTemp(temp);

  // NOTE: temps allocated while transforming cond never overwrite that of the sub-assig,
  // because:
  // * if l is simple, it _might_ share temps with the transformed cond, but
  //   they have taken effect before cond is evaluated at run-time
  // * if sub assig is not simple, cond is saved first, in the form of an iter, in a temp that might be
  //   even among its own allocated names, but it is in the left hand side and will only have a value
  //   when cond is evaluated (at run-time)
  return this.transform(
    this.synth_SubAssig(l, this.transform(cond, pushTarget, true)),
    pushTarget,
    false
  );
}; 

assigTransformers['ArrayPattern'] = function(n, pushTarget, isVal) {
  n.right = this.transform(n.right, null, true);

  var t = this.saveInTemp(this.synth_ArrIter(n.right), pushTarget);
  var list = n.left.elements;
  var e = 0;
  while (e < list.length) {
    var elem = list[e++];
    var result = this.transform(
      this.synth_SubAssig(elem, this.synth_ArrIterGet(t)),
      pushTarget,
      false
    );
    result && pushTarget.push(result);
  }
  this.releaseTemp(t);

  return this.synth_ArrIterEnd(t);
};
