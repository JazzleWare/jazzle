  import {ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

cls.absorbDirect =
function(ref) { return this.absorb(ref, true); };

cls.absorbIndirect =
function(ref) { return this.absorb(ref, false); };

cls.absorb =
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

cls.updateStats =
function(d, i) { this.d += d; this.i += i; };

cls.getDecl_nearest =
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

cls.getDecl_real =
function() {
  return this.getDecl_nearest().getDecl_real();
};

cls.assigned =
function() {
  // TODO: assert target ref is not a relocated ref (i.e., it is a master decl)
  var targetRef = this.getDecl_nearest().ref;
  if (targetRef.lhs < 0)
    targetRef.lhs = 0;
  return targetRef.lhs++;
};


