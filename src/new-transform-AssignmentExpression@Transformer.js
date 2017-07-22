var TransformByLeft = {};
TransformByLeft['ArrayPattern'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);
  var s = [],
      t = this.saveInTemp(this.synth_ArrIter(n.right), s),
      list = n.left.elements,
      idx = 0,
      tElem = null;

  var cbn = CB(n);
  while (idx < list.length) {
    var elem = list[idx];
    tElem = this.trArrayElem(elem, t, idx, isB, cbn);
    tElem && s.push(tElem);
    idx++;
  }

  tElem = this.synth_ArrIterEnd(t);
  tElem && s.push(tElem);

  this.releaseTemp(t);

  var res = this.synth_AssigList(s); // result
  var cb = CB(res), cbl = CB(n.left);

  this.ac(cb, 'bef', this.gec0(cbl, 'bef'));
  this.ac(cb, 'inner', this.gec0(cbl, 'inner'));
  this.ac(cb, 'left.aft', this.gec0(cbl, 'aft'));
  this.ac(cb, 'aft', this.gec0(CB(n), 'aft'));

  return res;
};

TransformByLeft['ObjectPattern'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);
  var s = [],
      t = this.saveInTemp(this.synth_ObjIter(n.right), s),
      l = n.left.properties,
      i = 0,
      tElem = null;

  while (i < l.length) {
    tElem = this.trObjElem(l[i], t, isB);
    tElem && s.push(tElem);
    i++;
  }

  isVal && s.push(this.synth_ObjIterEnd(t));

  this.releaseTemp(t);

  var res = this.synth_AssigList(s);
  var cb = CB(r), cbl = CB(n.left);

  this.ac(cb, 'bef', this.gec0(cbl, 'bef'));
  this.ac(cb, 'inner', this.gec0(cbl, 'inner'));
  this.ac(cb, 'left.aft', this.gec0(cbl, 'aft'));
  this.ac(cb, 'aft', this.gec0(CB(n), 'aft'));

  return res;
};

TransformByLeft['AssignmentPattern'] =
function(n, isVal, isB) {
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
    this.synth_UCond(test, consequent, t),
    isB
  );

  var res = this.tr(assig, isVal);
  var cb = CB(r);

  this.ac(cb, 'aft', this.gec0(CB(n), 'aft'));
  return r;
};

TransformByLeft['MemberExpression'] =
function(n, isVal, isB) {
  ASSERT_EQ.call(this, isB, false);
  if (n.operator === '**=') {
    var mem = n.left;
    mem.object = this.tr(mem.object, true );
    var t1 = this.allocTemp();
    mem.object = this.synth_TempSave(t1, mem.object);
    mem.property = this.tr(mem.property, true);
    var t2 = this.allocTemp();
    mem.property = this.synth_TempSave(t2, mem.property);
    this.releaseTemp(t2);
    this.releaseTemp(t1);
    var r = this.tr(n.right, true );

    n.left = mem;
    n.operator = '=';
    n.right = this.synth_node_BinaryExpression(
      this.synth_node_MemberExpression(t1,t2), '**', r);
  } else {
    n.left = this.trSAT(n.left);
    n.right = this.tr(n.right, true);
  }
  return n;
};

TransformByLeft['Identifier'] =
function(n, isVal, isB) {
  n.left = this.toResolvedName(n.left, isB ? 'binding' : 'sat');
  n.right = this.tr(n.right, true);
  if (isB) {
    var target = n.left.target;
    if (!target.isReached())
      this.makeReached(target);
  } 
  else {
    n.left.target.ref.assigned();
    if (n.left.target.isRG())
      n = this.synth_GlobalUpdate(n, false);
  }
  return n;
};

Transformers['AssignmentExpression'] =
function(n, isVal, isB) {
  return TransformByLeft[n.left.type].call(this, n, isVal, false);
};

Transformers['#SynthAssig'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  return TransformByLeft[n.left.type].call(this, n, isVal, n.binding);
};

this.trArrayElem =
function(left, iter, at, isB, cbn) {
  var right = null, rest_cb = null;
  if (left && left.type === 'RestElement') {
    right = this.synth_ArrIterGetRest(iter, at);
    rest_cb = CB(left);
    left = left.argument;
  }
  else
    right = this.synth_ArrIterGet(iter, at);

  if (left === null) {
    if (cbn.h < cbn.holes.length) {
      var h = cbn.holes[cbn.h];
      if (h[0] <= at) {
        this.ac(CB(right), 'bef', h[1]);
        cbn.h++;
      }
    }
    return right;
  }

  var assig = this.synth_SynthAssig(left, right, isB);

  var res = this.tr(assig, false), cb = CB(res);
  if (rest_cb) {
    this.ac(cb, 'bef', this.gec0(rest_cb, 'bef'));
    this.ac(cb, 'aft', this.gec0(rest_cb, 'aft'));
  }
  return res;
};

this.trObjElem =
function(elem, iter, isB) {
  var name = elem.key;
  if (elem.computed)
    name = elem.key = this.tr(name, true );

  var right = this.synth_ObjIterGet(iter, name, elem.computed);
  var left = elem.value;

  return this.tr(this.synth_SynthAssig(left, right), false, isB);
};
