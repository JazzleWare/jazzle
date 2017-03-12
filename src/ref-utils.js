function isArguments(mname) {
  return mname === _m('arguments');
}

function isCalledSuper(mname) {
  return mname === _m('special:supermem');
}

function isMemSuper(mname) {
  return mname === _m('special:supercall');
}

function isNewTarget(mname) {
  return mname === _m('new.target');
}

function isLexicalThis(mname) {
  return mname === _m('special:this');
}
