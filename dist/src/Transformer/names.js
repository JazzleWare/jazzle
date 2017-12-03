  import {_m} from '../other/scope-util.js';
  import {HAS, CHK_NONE, CHK_T, ASSERT, CVTZ_T} from '../other/constants.js';
  import {cls} from './cls.js';

cls.getTCCache =
function(decl) {
  var mname =_m(decl.ref.scope.scopeID+':'+decl.name);
  return decl.ref.scope.reached ? this.cvtz[mname] :
    HAS.call(this.cvtz, mname) ? this.cvtz[mname] : CHK_NONE;
};

cls.needsTZ =
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
    if (decl.isClassName())
      return tz;

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

cls.cacheTZ =
function(decl) {
  var tc = this.getTCCache(decl);
  if (tc)
    ASSERT.call(this, !(tc & CHK_T), 'cache');
  else
    tc = CHK_NONE;
  this.cvtz[_m(decl.ref.scope.scopeID+':'+decl.name)] = tc | CHK_T;
};

cls.makeReached =
function(target) {
  ASSERT.call(this, target.reached === null, 'reached used');
  target.reached = this.reachedRef;
};

cls.toResolvedName =
function(id, bes, manualActivation) {
  ASSERT.call(this, id.type == 'Identifier', 'no');

  var ref = id['#ref'], target = ref.getDecl_real();
  ASSERT.call(this, target, 'unresolved <'+id.name+'>');

  var isB = bes === 'binding';

  var hasTZ = !isB && this.needsTZ(target);
  if (hasTZ) {
    if (target.isClassName())
      return this.synthCheckForTZ(target, null, -1);

    target.activateTZ();
    this.accessTZ(target.ref.scope);
  }

  if (hasTZ) id['#cvtz'] |= CVTZ_T;

  id.type = '#-ResolvedName.' + bes;
  return id;
};

cls.getDeclFor =
function(name, isB) {
  ASSERT.call(this, isB === true || isB === false, 'isB' );
  var target = null;
  if (isB)
    target = this.cur.findDeclAny_m(_m(name));
  else {
    var ref = this.cur.findRefAny_m(_m(name));
    ASSERT.call(this, ref, 'name is not used in the current scope: <'+name+'>');
    target = ref.getDecl_real();
  }
  return target;
};

cls.synthCheckForTZ =
function(target, t, num) {
  this.accessJZ();
  return {
    liq: t,
    idx: num,
    kind: 'tzchk',
    type: '#Untransformed' ,
    target: target
  };

};


