this.synthesizeNamesInto = function(scs) {
  var list = this.funcHead.paramList,
      i = 0,
      len = list.length,
      elem = null;

  var alreadySynthesized = {};
  while (i < len) {
    elem = list[i++];
    var mname = _m(elem.name);
    if (HAS.call(alreadySynthesized, mname))
      continue;
    scs.synthDecl(elem);
    alreadySynthesized[mname] = true;
  }

  list = this.defs, i = 0, len = list.length();
  while (i < len) {
    elem = list.at(i++);
    if (elem.ref.scope === this)
      scs.synthDecl(elem);
    else
      ASSERT.call(this, elem.ref.scope === this.funcHead,
        'fn-level names must either belong to the fn-body or the fn-head');
  }
};
