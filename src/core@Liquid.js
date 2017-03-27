this.trackScope = function(scope) {
  var cur = scope, end = this.scope.scs;
  // var ownerReached = false;
  while (true) {
    // if (cur === this.scope) ownerReached = true;
    if (cur.isConcrete()) {
      // if we have tracked a scope, all of its parents have also been tracked
      if (HAS.call(this.crsMap, cur.id))
        break;

       this.crsMap[cur.id] = cur;
       this.crsList.push(cur);
    }

    if (cur === end)
      break;

    cur = cur.parent;
    ASSERT.call(this, cur !== null,
      'scope '+scope.id+' is not included in the scs for scope '+this.scope.id+
      ' (a liquid is only allowed to be accessed in descendant scopes)');
  }
};

this.i = function(idealName) {
  ASSERT.call(this. this.idealName === "",
    'an ideal name has already been set on this liquid');
  this.idealName = idealName;
  return this;
};
