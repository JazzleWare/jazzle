this.trackScope = function(from, to) {
  if (from.isAnyFnHead())
    from = from.funcBody;
  var cur = from, end = to || this.scope.scs;


  // var ownerReached = false;
  while (end !== cur) {
    // if (cur === this.scope) ownerReached = true;
    if (cur.isConcrete() && !cur.isAnyFnHead()) {
      // if we have tracked a scope, all of its parents have also been tracked
      if (HAS.call(this.crsMap, cur.id))
        break;

       this.crsMap[cur.id] = cur;
       this.crsList.push(cur);
    }
    cur = cur.parent;
    ASSERT.call(this, cur !== null,
      'scope '+from.id+' is not included in the scs for scope '+end+
      ' (a liquid is only allowed to be accessed in descendant scopes)');
  }
};

this.i = function(idealName) {
  ASSERT.call(this, this.idealName === "",
    'an ideal name has already been set on this liquid');
  this.idealName = idealName;
  return this;
};

this.setSynthName = function(synthName) {
  ASSERT.call(this, this.synthName === "",
    'this liquid has already got a synth-name');
  this.synthName = synthName;
  if (this.associatedDecl)
    this.associatedDecl.setSynthName(synthName);
  return this;
};

this.associateWith = function(decl) {
  ASSERT.call(this, this.associatedDecl === null,
    'this liquid has already got an associate');
  this.associatedDecl = decl;
  var list = this.associatedDecl.ref.lors, i = 0;
  while (i < list.length) {
    var rs = list[i++];
    if (!HAS.call(this.crsMap, rs)) {
      this.crsMap[i] = rs;
      this.crsList.push(rs);
    }
  }
};
