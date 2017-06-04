this.synth_defs_to =
function(targetScope) {
  var list = this.defs, e = 0, len = list.length();
  while (e < len) {
    var tdclr = list.at(e++);
    this.owns(tdclr) && targetScope.synthDecl(tdclr);
  }
};
