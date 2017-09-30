this.synth_defs_to =
function(targetScope) {
  var list = this.defs, e = 0, len = list.length(), insertSelf = this.isCatch() && !this.argIsSimple;
  while (e < len) {
    var tdclr = list.at(e++);
    if (this.owns(tdclr) && !tdclr.isFnArg() && !tdclr.isCatchArg()) {
      targetScope.synthDecl(tdclr);
      insertSelf && this.insertSynth_m(_m(tdclr.synthName), tdclr);
    }
  }
};
