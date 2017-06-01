this.s =
function(s) {
  ASSERT_EQ.call(this, this.site, null);
  this.site = s;
  return this;
};

this.r =
function(r) {
  ASSERT_EQ.call(this, this.ref, null);
  ASSERT_EQ.call(this, r.targetDecl, null);
  ASSERT_EQ.call(this, r.hasTarget, false);
  this.ref = r;
  r.targetDecl = this;
  r.hasTarget = true;
  return this;
};

this.n =
function(n) {
  ASSERT_EQ.call(this, this.name, "");
  this.name = n;
  return this;
};

this.t =
function(t) {
  ASSERT_EQ.call(this, this.type, DT_NONE);
  this.type = t;
  return this;
};

this.activateTZ =
function() {
  if (this.hasTZCheck)
    return false;
  this.hasTZCheck = true;
  this.ref.scope.activateTZ();
  return true;
};
