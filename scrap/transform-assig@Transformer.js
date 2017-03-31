var transformAssig = {};
transform['SyntheticAssignment'] =
transform['AssignmentExpression'] = function(n, list, isVal) {
  var transformer = transformAssig[n.left.type], tr = null;
  if (n.type === 'SyntheticAssignment') {
    tr = transformer.call(this, n, list, isVal);
    push_if_assig(tr, list);
    ASSERT.call(this, !isVal, 'synthetic assignment must not be transformed as a value');
    return NOEXPR;
  }

  // transforms-to-sequence
  var tts = false;
  if (!list) { // i.e., list is not a yield container
    list = [];
    tts = true;
  }
  var rightTemp = n.left.type !== 'Identifier' ? this.allocTemp() : null;
  this.evalLeft(n.left, n.right, list);
  rightTemp && this.rl(rightTemp);
  tr = transformer.call(this, n, list, isVal);
  if (tts) {
    if (isVal) push_checked(tr, list);
    else push_if_assig(tr, list);
    return synth_seq(list, isVal);
  }
  
  return tr;
};

// TODO: things like `[a[yield]] = 12` are currently transformed as:
// `t1 = a; yield; t2 = sent; t = arrIter(12); t1[t2] = t.get()`
// from an optimal perspective, this should rather be:
// `t1 = a; yield; t = arrIter(12); t1[sent] = t.get()`
// generally speaking, an 'occupySent' should exist, and should be used by any expression
// that makes use of sent; each call to this hypothetical 'occupySent' will then return 'sent',
// saving the current expression that is using 'sent' in a temp, and further replacing that expression with
// the temp it is saved in. 
// observation: if there are no temps needed for its right, the element need not be saved
var evalLeft = {};
this.evalLeft = function(left, right, list) {
  return evalLeft[left.type].call(this, left, right, list);
};

evalLeft['Identifier'] = function(left, right, list) {
  return;
};

transformAssig['Identifier'] = function(n, list, isVal) {
  n.right = this.tr(n.right, list, true);
  return n;
};

evalLeft['MemberExpression'] = function(left, right, list) {
  left.object = this.tr(left.object, list, true);
  if (right === null || this.y(right))
    left.object = this.save(left.object, list);
  if (left.computed) {
    left.property = this.tr(left.property, list, true);
    if (right === null || this.y(right))
      left.property = this.save(left.property, list);
  }
};

transformAssig['MemberExpression'] = function(n, list, isVal) {
  var left = n.left;
  n.right = this.tr(n.right, list, true);
  
  // `a()[b()] = (yield a()) * (yield)`, you know
  this.rlit(left.property);
  this.rlit(left.object);
  return n;
};

var assigPattern = {};
this.assigPattern = function(left, right, list) {
  return assigPattern[left.type].call(this, left, right, list);
};

this.evalProp = function(elem, list) {
  if (elem.computed) {
    elem.key = this.tr(elem.key, list, true);
    elem.key = this.save(elem.key, list);
  }
  this.evalLeft(elem.value, null, list);
};
 
evalLeft['ObjectPattern'] = function(left, right, list) {
  var elems = left.properties, e = 0;
  while (e < elems.length)
    this.evalProp(elems[e++], list);
};
 
assigPattern['ObjectPattern'] = function(left, right, list) {
  var elems = left.properties, e = 0;
  while (e < elems.length) {
    var elem = elems[e];
    this.tr(
      synth_assig_explicit(elem.value,
        synth_call_objIter_get(right, getExprKey(elem))
      ), list, false
    );
    e++;
  }
};

transformAssig['ObjectPattern'] = function(n, list, isVal) {
  // var iterVal = this.allocTemp();
  // this.evalLeft(n.left, /* TODO: unnecessary */n.right, list);
  // this.rl(iterVal);
  n.right = this.tr(n.right, list, true);
  var iter = this.save(wrapObjIter(n.right), list);
  this.assigPattern(n.left, iter, list);
  this.rl(iter);
  return isVal ? iterVal(iter) : NOEXPR;
};

evalLeft['ArrayPattern'] = function(left, right, list) {
  var elems = left.elements, e = 0;
  while (e < elems.length)
    this.evalLeft(elems[e++], null, list);
};

assigPattern['ArrayPattern'] = function(left, right, list) {
  var elems = left.elements, e = 0;
  while (e < elems.length) {
    this.tr(
      synth_assig_explicit(elems[e],
        synth_call_arrIter_get(right)
      ), list, false
    );
    e++;
  }
};

transformAssig['ArrayPattern'] = function(n, list, isVal) {
  // var iterVal = this.allocTemp();
  // this.evalLeft(n.left, /* TODO: unnecessary */n.right, list);
  // this.rl(iterVal);
  n.right = this.tr(n.right, list, true);
  var iter = this.save(wrapArrIter(n.right), list);
  this.assigPattern(n.left, iter, list);
  this.rl(iter);
  return isVal ? iterVal(iter) : NOEXPR;
}; 

evalLeft['AssignmentPattern'] = function(left, right, list) {
  return this.evalLeft(left.left, right, list);
};

transformAssig['AssignmentPattern'] = function(n, list, isVal) {
  var assigDefault = null, t = null, left = n.left;
  t = this.allocTemp();
  assigDefault = synth_cond(
       wrapInUnornull(
         synth_assig_explicit(t,
           n.right // not transformed -- it's merely a synth call in the form of either #t.get() or #t.get('<string>')
         ) ), left.right, t );
  this.rl(t);
  assigDefault = this.tr(assigDefault, list, true);
  push_checked(this.tr(synth_assig(left.left, assigDefault), list, isVal), list);
  return NOEXPR;
};

