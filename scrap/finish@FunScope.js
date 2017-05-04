this.finish =
function() {
  ASSERT.call(this, this.inBody, 'finish must be in body');
  var list = this.refs, len = list.length();
  var e = 0, mname = "", ref = null;

  this.deactivateBody();
  while (e<len) {
    ref = list.at(e);
    mname = list.keys[e];
    this.refInHead(mname, ref);
    e++;
  }

  Scope.finish.call(this);
};
