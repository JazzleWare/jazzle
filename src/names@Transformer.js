this.getTCCache =
function(decl) {
  var mname =_m(decl.ref.scope.scopeID+':'+decl.name);
  return decl.ref.scope.reached ? this.cvtz[mname] :
    HAS.call(this.cvtz, mname) ? this.cvtz[mname] : CHK_NONE;
};

this.needsTZ =
function(decl) {
  if (!decl.isTemporal())
    return false;

  var tc = this.getTCCache(decl) ;
  if (tc && (tc & CHK_T))
    return false;

  TZ: {
    var tz = false;
    if (!decl.isReached()) {
      tz = true;
      break TZ; 
    }
    var ownerScope = decl.ref.scope, cur = this.cur;
    if (ownerScope === cur) {
      tz = false;
      break TZ;
    }
    while (cur.parent !== ownerScope) {
      cur = cur.parent;
      ASSERT.call(this, cur, 'reached top before decl owner is reached -- tz test is only allowed in scopes that '+
        'can access the decl');
    }
    tz = cur.isHoisted();
  }
  tz && this.cacheTZ(decl);
  return tz;
};

this.cacheTZ =
function(decl) {
  var tc = this.getTCCache(decl);
  if (tc)
    ASSERT.call(this, !(tc & CHK_T), 'cache');
  else
    tc = CHK_NONE;
  this.cvtz[_m(decl.ref.scope.scopeID+':'+decl.name)] = tc | CHK_T;
};

this.makeReached =
function(target) {
  ASSERT.call(this, target.reached === null, 'reached used');
  target.reached = this.reachedRef;
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
    cv: false,
    kind: 'resolved-name',
    type: '#Untransformed'
  };
};
