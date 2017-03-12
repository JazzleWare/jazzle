function sentVal() {
  return specialId('sentVal'); 
}
function isSentVal(id) {
  return isspecial(id, 'sentVal');
}

function arrIter() {
  return specialId('arrIter');
}
function wrapArrIter(expr) {
  return { type: 'CallExpression', callee: arrIter(), arguments: [expr] };
}
function isArrIter(id) {
  return isspecial(id, 'arrIter');
}

function objIter() {
  return specialId('objIter');
}
function wrapObjIter(expr) {
  return { type: 'CallExpression', callee: objIter(), arguments: [expr] };
}
function isObjIter(id) {
  return isspecial(id, 'objIter');
}

function unornull() {
  return specialId('unornull');
}
function isUnornull(id) {
  return isspecial(id, 'unornull');
}
function wrapInUnornull(expr) {
  var n = synth_call(unornull(), [expr]);
  n.type = 'Unornull';
  return n;
}

function iterVal(id) {
  return synth_mem(id, synth_id('val'), false);
}

function newTemp(t) {
  return { type: 'SpecialIdentifier', kind: 'tempVar', name: t };
}
function isTemp(id) {
  return isspecial(id, 'tempVar');
}

function specialId(kind) {
  return { type: 'SpecialIdentifier', kind: kind };
}
function isspecial(n, kind) {
  return n.type === 'SpecialIdentifier' && n.kind === kind;
}

function getExprKey(kv) {
  return kv.computed ? kv.key : synth_lit_str(kv.key.name);
}

function push_checked(n, list) {
  if (n !== NOEXPR) list.push(n);
}

function push_if_assig(n, list) {
  if (n && 
    ( n.type === 'AssignmentExpression' || n.type === 'SyntheticAssignment' ) )
    list.push(n);
}

function functionHasNonSimpleParams(fn) {
  var list = fn.params, i = 0;
  while (i < list.length)
    if (list[i++].type !== 'Identifier')
      return true;
  
  return false;
}
