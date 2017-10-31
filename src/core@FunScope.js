this.setRefsAndArgRefs =
function(refs) {
  ASSERT.call(this, !this.inBody, 'sraar must be in args');
  var len = refs.length(), e = 0;
  while (e < len) refs.at(e++).scope = this;
  this.argRefs = refs;
  this.refs = this.argRefs;
};

this.getNonLocalLoopLexicals =
function() {
  var argRefs = this.argRefs, e = 0, len = argRefs.length(), target = null;
  var list = null;
  while (e < len) {
    var ref = argRefs.at(e++);
    if (ref === null)
      continue;

    target = ref.getDecl_nearest();
    if (target === this.scopeName)
      continue;
    if (target === this.spArguments)
      continue;
    if (target === this.spThis)
      continue;
    if (target.isLiquid()) {
      switch (target.category) {
      case '<this>':
      case '<arguments>':
      case 'scall': continue;
      }
    }

    ASSERT.call(this, !target.isLiquid(), 'got liquid');
    ASSERT.call(this, !this.owns(target), 'local');

    if (target.isLexicalLike() && target.ref.scope.insideLoop()) {
      var mname = _m(target.name);
      var ll = this.getClosureLLINOSA_m(mname);
      if (ll) ASSERT.call(this, ll === target, 'll');
      else {
        (list || (list = [])).push(target);
        this.insertClosureLLINOSA_m(mname, target);
      }
    }
  }

  return list;
};
