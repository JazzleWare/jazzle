this.cls = function() {
  ASSERT.call(this, this.isClassMem(),
     'scopes that are not classmems can not have '+
     'class');
  ASSERT.call(this, this.parent.parent.isClass(),
     'this scope is a classmem and must have a '+
     'class for its parent');
  return this.parent.parent;
};

this.setHead = function(head) {
  ASSERT.call(this, this.funcHead === null,
    'this fn has got an actual head');
  this.funcHead = head;
  this.funcHead.funcBody = this;
};
