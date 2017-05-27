this.synth_Temp =
function(liq) {
  return {
    kind: 'temp',
    occupied: 0,
    liq: liq,
    type: '#Untransformed'
  };
};

this.synth_TempSave =
function(t, expr) {
  ASSERT.call(this, isTemp(t), 't is not temp');
  if (sameTemp(t, expr))
    return null;
  return {
    kind: 'temp-save',
    right: expr,
    left: t,
    type: '#Untransformed'
  };
};
