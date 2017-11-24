
this.finish =
function() {
  if (this.isAnyFn() || this.isCatch())
    this.finishBody();

  return this.handOverRefList(this.refs);
};

this.finishBody =
function() {
  ASSERT.call(this, this.inBody, 'finish must be in body');
  var list = this.refs, len = list.length();
  var e = 0, mname = "", ref = null;

  var isCatch = this.isCatch();
  this.deactivateBody();
  this.inBody = true;
  while (e<len) {
    ref = list.at(e);
    mname = list.keys[e];
    if (ref && (ref.d || ref.i)) {
      if (isCatch)
        this.refDirect_m(mname, ref);
      else
        this.refInHead(mname, ref);
    }
    e++;
  }
  this.inBody = false;
};

