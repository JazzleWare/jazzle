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
  var t = this.tempStack.pop();
  t.occupied = true;

  return t;
};

this.prepareTemp = function() {
  var t = this.currentScope.accessLiquid(this.currentScope.scs, 't', true);
  t.idealName = 't';
  this.tempStack.push(makeTemp(t));
};

this.releaseTemp = function(temp, ensureFAT) {
  ASSERT.call(this, temp !== null, 'temp is not allowed to be null');
  ASSERT.call(this, temp.occupied, 'a temp has to be an occupied temp in order to be released');
  this.tempStack.push(temp);
  temp.occupied = false;
  if (ensureFAT)
    this.ensureFAT(ensureFAT);
};

function makeTemp(liquid) {
  return {
    type: '#Untransformed', kind: 'temp', name: liquid.name, liquid: liquid, occupied: false
  };
}

this.saveInTemp = function(expr, pushTarget) {
  var t = this.allocTemp();
  pushTarget.push(this.synth_TempSave(t, expr));
  return t;
};
