this.makeReached =
function(target) {
  ASSERT.call(this, target.reached === null, 'reached used');
  target.reached = this.reachedRef;
};

this.needsTZ =
function(decl) {
  if (!decl.isTemporal())
    return false;

  if (!decl.isReached())
    return true;

  var ownerScope = decl.ref.scope, cur = this.cur;
  if (ownerScope === cur)
    return false;

  while (cur.parent !== ownerScope) {
    cur = cur.parent;
    ASSERT.call(this, cur, 'reached top before decl owner is reached -- tz test is only allowed in scopes that '+
      'can access the decl');
  }
  return cur.isHoisted();
};

this.toResolvedName =
function(id, bes) {
  var name = id.name, target = null;
  var isB = bes === 'binding';
  if (isB)
    target = this.cur.findDeclAny_m(_m(name));
  else {
    var ref = this.cur.findRefAny_m(_m(name));
    ASSERT.call(this, ref, 'name is not used in the current scope: <'+name+'>');
    target = ref.getDecl();
  }

  ASSERT.call(this, target, 'unresolved <'+name+'>');
  var hasTZ = !isB && this.needsTZ(target);
  
  if (hasTZ) {
    target.activateTZ();
    this.accessTZ(target.ref.scope);
  }

  return {
    target: target,
    bes: bes,
    id: id,
    tz: hasTZ,
    type: '#Untransformed' ,
    kind: 'resolved-name'
  };
};
