this.findFAT = function() {
  if (this.tempStack.length === 0)
    this.prepareTemp();
  return this.tempStack[this.tempStack.length-1];
};

this.ensureFAT = function(t) {
  if (t === null)
    ASSERT.call(this, this.tempStack.length === 0,
      'temps must be empty');
  else
    ASSERT.call(this, this.findFAT() === t,
      'FAT mismatch');
};

this.allocTemp = function() {
  if (this.tempStack.length === 0)
    this.prepareTemp();
  return this.tempStack.pop();
};

this.prepareTemp = function() {
  var t = this.currentScope.accessLiquid(this.currentScope.scs, 't', true);
  t.idealName = 't';
  this.tempStack.push(t);
};

this.releaseTemp = function(temp, ensureFAT) {
  ASSERT.call(this, temp !== null, 'temp is not allowed to be null');
  this.tempStack.push(temp);
  if (ensureFAT)
    this.ensureFAT(ensureFAT);
};
