var TransformByLeft = {};
TransformByLeft['ArrayPattern'] =
function(n, isVal) {
  n.right = this.tr(n.right, true);
  var s = [],
      t = this.saveInTemp(this.synth_ArrIter(n.right), s),
      list = n.left.elements,
      idx = 0,
      tElem = null;

  while (idx < list.length) {
    tElem = this.trArrayElem(list[idx], t, idx);
    tElem && s.push(tElem);
    idx++;
  }

  tElem = this.synth_ArrIterEnd(t);
  tElem && s.push(tElem);

  this.releaseTemp(t);
  return this.synth_AssigList(s);
};

TransformByLeft['ObjectPattern'] =
function(n, isVal) {
  n.right = this.tr(n.right, true);
  var s = [],
      t = this.saveInTemp(this.synth_ObjIter(n.right), s),
      l = n.left.properties,
      i = 0,
      tElem = null;

  while (i < l.length) {
    tElem = this.trObjElem(l[i], t);
    tElem && s.push(tElem);
    i++;
  }

  isVal && s.push(this.synth_ObjIterEnd(t));

  this.releaseTemp(t);
  return this.synth_AssigList(s);
};

TransformByLeft['AssignmentPattern'] =
function(n, isVal) {
  var l = n.left.left;
  var d = n.left.right;
  var r = n.right;

  ASSERT.call(this, r.type === '#Untransformed',
    'assignment pattern can not have a transformable right');

  var t = this.allocTemp();

  var test = this.synth_U(this.synth_TempSave(t, r));
  this.releaseTemp(t);

  var consequent = this.tr(d, true);
  var assig = this.synth_SynthAssig(
    l,
    this.synth_UCond(test, consequent, t)
  );

  return this.tr(assig, isVal);
};


TransformByLeft['MemberExpression'] =
function(n, isVal) {
  n.left = this.trSAT(n.left);
  n.right = this.tr(n.right, true);
  return n;
};

Transformers['AssignmentExpression'] =
function(n, isVal) {
  return TransformByLeft[n.left.type].call(this, n, isVal);
};

Transformers['#SynthAssig'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  return TransformByLeft[n.left.type].call(this, n, isVal);
};

this.trArrayElem =
function(left, iter, at) {
  var right = this.synth_ArrIterGet(iter, at);
  var assig = this.synth_SynthAssig(left, right);
  return this.tr(assig, false);
};

this.trObjElem =
function(elem, iter) {
  var name = elem.key;
  if (elem.computed)
    name = elem.key = this.tr(name, true );

  var right = this.synth_ObjIterGet(iter, name, elem.computed);
  var left = elem.value;

  return this.tr(this.synth_SynthAssig(left, right), false);
};
