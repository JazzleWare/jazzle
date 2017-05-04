this.absorbDirect =
function(ref) { return this.absorb(ref, true); };

this.absorbIndirect =
function(ref) { return this.absorb(ref, false); };

this.absorb =
function(childRef, refD) {
  ASSERT.call(this, !refD.isReolved,
    'resolved ref are not allowed to get absorbed by another ref');
  ASSERT.call(this, !refD.parent,
    'a ref with a parent is not allowed to get absorbed by another ref');

  if (refD) {
    this.d += refD.d;
    this.i += refD.i;
  } else
    this.i += refD.d + refD.i

  if (childRef.rsList.length)
    this.rsList = childRef.rsList.concat(this.rsList);

  if (childRef.scope.hasSignificantNames())
    this.rsList.push(childRef);

  childRef.parent = this;
};
