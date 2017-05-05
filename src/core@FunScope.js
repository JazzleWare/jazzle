this.setRefsAndArgRefs =
function(refs) {
  ASSERT.call(this, !this.inBody, 'sraar must be in args');
  this.argRefs = refs;
  this.refs = this.argRefs;
};
