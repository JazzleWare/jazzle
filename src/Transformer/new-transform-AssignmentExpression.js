  import {TransformByLeft, Transformers} from '../other/globals.js';
  import {CB, tg, tzc, cvc} from '../other/util.js';
  import {ASSERT, ASSERT_EQ, CVTZ_C, CHK_V, CHK_NONE} from '../other/constants.js';
  import {_m} from '../other/scope-util.js';
  import {cls} from './cls.js';

TransformByLeft['ArrayPattern'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);

  var s = [],
      t = this.saveInTemp(this.synth_ArrIter(n.right), s),
      list = n.left.elements,
      idx = 0,
      tElem = null;

  var cbl = CB(n.left);
  while (idx < list.length) {
    var elem = list[idx];
    tElem = this.trArrayElem(elem, t, idx, isB, cbl);
    tElem && s.push(tElem);
    idx++;
  }

  tElem = this.synth_ArrIterEnd(t);
  tElem && s.push(tElem);

  this.releaseTemp(t);

  var res = this.synth_AssigList(s); // result
  var cb = CB(res);

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
  var cb = CB(res), cbl = CB(n.left);

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

  var test = this.synth_U(this.synth_TempSave(t, r) || t);
  this.releaseTemp(t);

//var cvtz = this.setCVTZ(createObj(this.cvtz));
  var consequent = /* this.tr(d, true) */ d;
//this.setCVTZ(cvtz);

  var assig = this.synth_SynthAssig(
    l,
    this.synth_UCond(test, consequent, t, (true)),
    isB
  );

  var res = this.tr(assig, isVal);
  var cb = CB(res);

  this.ac(cb, 'aft', this.gec0(CB(n.left), 'aft'));
  return res;
};

TransformByLeft['MemberExpression'] =
function(n, isVal, isB) {
  ASSERT_EQ.call(this, isB, false);
  if (n.operator === '**=') {
    var mem = n.left;
    mem.object = this.tr(mem.object, true );
    var t1 = this.allocTemp();
    mem.object = this.synth_TempSave(t1, mem.object);
    var t2 = null;
    if (mem.computed) {
      mem.property = this.tr(mem.property, true);
      t2 = this.allocTemp();
      mem.property = this.synth_TempSave(t2, mem.property);
      this.releaseTemp(t2);
    } else
      t2 = mem.property;

    this.releaseTemp(t1);
    var r = this.tr(n.right, true );

    n.left = mem;
    n.operator = '=';

    var sm = this.synth_node_MemberExpression(t1,t2);
    sm.computed = mem.computed;
    sm.loc = mem.loc;
    sm['#acloc'] = mem['#acloc'];

    n.right = this.synth_node_BinaryExpression(sm, '**', r);
  } else {
    n.left = this.trSAT(n.left);
    n.right = this.tr(n.right, true);
  }
  return n;
};

TransformByLeft['Identifier'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);
  var rn = n.left = this.toResolvedName(n.left, isB ? 'binding' : 'sat', true); // target
  if (!isB) {
    var l = tg(n.left);
    l.ref.assigned();
    if (this.needsCVLHS(l)) {
      n.left['#cvtz'] |= CVTZ_C;
      this.cacheCVLHS(l);
    }
    else if (l.isRG())
      n = this.synth_GlobalUpdate(n, false);
  }

  if (tzc(rn) || cvc(rn))
    n.right = this.synth_TC(n.right, n.left)

  if (isB) {
    var target = tg(n.left);
    if (!target.isReached())
      this.makeReached(target);
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

  return this.tr(this.synth_SynthAssig(left, right, isB), false);
};

this.needsCVLHS =
function(decl) {
  if (!decl.isImmutable())
    return false;
  var tc = this.getTCCache(decl);
  if (tc && (tc & CHK_V))
    return false;
  return true;
};

this.cacheCVLHS =
function(decl) {
  var tc = this.getTCCache(decl);
  if (tc)
    ASSERT.call(this, !(tc & CHK_V), 'cache');
  else
    tc = CHK_NONE;
  this.cvtz[_m(decl.ref.scope.scopeID+':'+decl.name)] = tc | CHK_V;
};

