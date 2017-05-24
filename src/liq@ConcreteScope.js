this.getL =
function(gName, idx, from) {
  var lg = this.getLG(gName);
  ASSERT.call(this, idx<lg.length, 'nir -- <'+idx+'>');
  var l = lg[idx];
  if (from !== null)
    l.track(from);
  return l;
};

this.gocL =
function(gName, idx, from) {
  var lg = this.gocLG(gName);
  ASSERT.call(this, idx<lg.length, 'nir -- <'+idx+'>');
  var l = lg[idx];
  if (from !== null)
    l.track(from);
  return l;
};

this.gocLG =
function(gName) {
  var lg = this.getLG(gName);
  return lg || this.createLG(gName);
};

this.getLG =
function(gName) {
  var mname = _m(gName);
  if (this.liquidDefs.has(mname))
    return this.liquidDefs.get(mname);
  return null;
};

this.createLG =
function(gName) {
  var mname = _m(gName);
  ASSERT.call(this, this.getLG(gName) === null, 'LGr exists');
  var l = this.createL(gName);

  return this.liquidDefs.set(mname, [l]);
};

this.createL =
function(gName) {
  return new Liquid(gName).r(new Ref(this));
};
