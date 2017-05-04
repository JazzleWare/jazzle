this.handOverRefList =
function(list) {
  var len = list.length(), i = 0;
  while (i<len) {
    var ref = list.at(i);
    if (!ref.hasTarget)
      this.handOver_m(list.keys[i], ref);
    i++;
  }
};

this.handOver_m =
function(mname, ref) {
  if (this.isBlock() || this.isBare())
    return this.parent.refDirect_m(mname, ref);

  if (this.isCatch()) {
    ASSERT.call(this, !this.inBody,
      'the body has to finish() before the handover begins');
    return this.parent.refDirect_m(mname, ref);
  }

  if (this.isClass() && this.isExpr() &&
    this.scopeName && this.scopeName.hasName_m(mname))
    return this.scopeName.ref.absorbDirect(ref);

  ASSERT.call(this, this.isScript(),
    'a script scope was expected');

  ASSERT.call(this, this.parent.isGlobal(),
    'script must have a parent scope with type global');

  if (ref_this_m(mname))
    return this.spCreate_this(ref);

  return this.parent.spCreate_global(mname, ref);
};
