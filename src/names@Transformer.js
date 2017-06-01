this.toResolvedName =
function(id, isB) {
  var name = id.name, target = null;
  if (isB)
    target = this.cur.findDecl_m(_m(name));
  else {
    var ref = this.findRef_m(_m(name));
    ASSERT.call(this, ref, 'name is not used in the current scope: <'+name+'>');
    target = ref.getDecl();
  }

  ASSERT.call(this, target, 'unresolved <'+name+'>');
  var hasTZ = !isB && this.needsTZ(decl);
  
  if (hasTZ) {
    decl.activateTZ();
    this.accessTZ(decl.ref.scope);
  }

  return {
    target: target,
    binding: isB,
    id: id,
    tz: hasTZ,
    type: '#Untransformed' ,
    kind: 'resolved-name'
  };
}; 

this.needsTZ =
function(decl) {
  if (!decl.isTemporal())
    return false;

  if (!decl.reached)
    return true;

  var ownerScope = decl.ref.scope, cur = this.cur;
  if (ownerScope === cur)
    return false;

  while (true) {
    if (cur.parent === ownerScope)
      break;
    cur = cur.parent
    ASSERT.call(this, cur, 'reached top before decl owner is reached -- tz test is only allowed in scopes that '+
      'can access the decl');
  }
  return cur.isHoisted();
};
