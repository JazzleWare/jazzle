this.absorbDirect =
function(ref) { return this.absorb(ref, true); };

this.absorbIndirect =
function(ref) { return this.absorb(ref, false); };

this.absorb =
function(childRef, refD) {
  ASSERT.call(this, !childRef.hasTarget,
    'resolved ref are not allowed to get absorbed by another ref');
  ASSERT.call(this, !childRef.parentRef,
    'a ref with a parent is not allowed to get absorbed by another ref');

  if (refD) {
    this.d += childRef.d;
    this.i += childRef.i;
  } else
    this.i += childRef.d + childRef.i

  if (childRef.rsList.length)
    this.rsList = childRef.rsList.concat(this.rsList);

  if (childRef.scope.hasSignificantNames())
    this.rsList.push(childRef.scope);

  childRef.parentRef = this;
};

this.updateStats =
function(d, i) { this.d += d; this.i += i; };

this.getDecl_nearest =
function() {
  if (this.targetDecl_nearest !== null)
    return this.targetDecl_nearest;
  var ref = this.parentRef;
  while (ref) {
    if (ref.targetDecl_nearest)
      return this.targetDecl_nearest = ref.targetDecl_nearest;
    ref = ref.parentRef;
  }

  ASSERT.call(this, false, 'ref unresolved');
};

this.getDecl_real =
function() {
  return this.getDecl_nearest().getDecl_real();
};

this.assigned =
function() {
  // TODO: assert target ref is not a relocated ref (i.e., it is a master decl)
  var targetRef = this.getDecl_nearest().ref;
  if (targetRef.lhs < 0)
    targetRef.lhs = 0;
  return targetRef.lhs++;
};

this.cut =
function() {
  ASSERT.call(this, this.hasTarget, 'cut');
  this.hasTarget = false;
  this.targetDecl_nearest = null;

  return this;
};

this.getLHS =
function() {
  var targetRef = this.getDecl().ref;
  return targetRef.lhs < 0 ? 0 : targetRef.lhs;
};

this.updateRSList =
function(rsList) {
  var rsMap = {};
  var e = 0;
  var list = this.rsList;
  while (e < list.length)
    rsMap[list[e++].scopeID] = true;

  e = 0;
  list = rsList;
  while (e < list.length) {
    var elem = list[e++];
    if (!HAS.call(rsMap, elem.scopeID)) {
      this.rsList.push(elem);
      rsMap[elem.scopeID] = true
    }
  }

  return this;
};
