this.t =
function(t) {
  ASSERT_EQ.call(this, this.type, DT_NONE);
  this.t = t;
  return this;
};

this.r =
function(r) {
  ASSERT_EQ.call(this, this.ref, null);
  ASSERT_EQ.call(this, r.targetDecl, null);
  ASSERT_EQ.call(this, r.hasTarget, false);
  this.ref = r;
  r.targetDecl = this;
  this.hasTarget = true;
  return this;
};

this.n =
function(n) {
  ASSERT_EQ.call(this, this.name, "");
  this.name = n;
  return this;
};
