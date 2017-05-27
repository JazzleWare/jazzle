this.releaseTemp =
function(t) {
  ASSERT.call(this, t.occupied, 'unoccupied temp');
  t.occupied = false;
  return t;
};
 
this.saveInTemp =
function(expr, list) {
  var t = this.allocTemp();
  var tsave = this.synth_TempSave(t, expr);
  tsave && list.push(tsave);
  return t;
};

this.createTemp =
function() {
  var liq = this.cur.scs.gocLG('<t>').newL();
  liq.name = 't';
  return this.synth_Temp(liq);
};

this.allocTemp =
function() { 
  var t = null;
  if (this.tempStack.length !== 0)
    t = this.tempStack.pop();
  else {
    t = this.createTemp();
    this.tempStack.push(t);
  }
  ASSERT.call(this, t.occupied === false, 'occupied temp');
  t.liq.track(this.cur);

  return t;
};
