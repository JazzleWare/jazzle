this.finish = 
function() {};

this.makeParams =
function(paramScope) {
  paramScope.setRefsAndArgRefs(this.refs);
  this.updateParentForSubScopesTo(paramScope);
  this.hasDissolved = true;
};

this.makeSimple =
function() {
  var list = this.refs;
  var i = 0;
  var len = list.length();

  var p = this.parent;
  while (i<len) {
    var mname = list.keys[i], ref = p.findRefAny_m(mname);
    var elem = list.get(mname);
    if (ref) ref.absorbDirect(elem);
    else { elem.scope = p; p.insertRef_m(mname, elem); }
    i++;
  }

  this.updateParentForSubScopesTo(p);
  this.hasDissolved = true;
};

this.updateParentForSubScopesTo =
function(sParent) {
  var list = this.ch, i = 0;
  while (i<list.length) {
    var elem = list[i];
    if (elem.isParen()) {
      ASSERT.call(this, elem.hasDissolved,
        'paren sub-scopes are not allowed to have remained intact -- they must have dissolved earlier');
      elem.updateParentForSubScopesTo(sParent);
    }
    else {
      ASSERT.call(this, elem.isAnyFn() || elem.isClass(),
        'current fn scopes are the only scope allowed '+
       'to come in a paren');
      elem.parent = sParent;
    }
    i++;
  }
};
