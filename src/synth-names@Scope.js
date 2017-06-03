this.synth_defs_to =
function(targetScope) {
  var list = this.defs, e = 0, len = list.length();
  while (e < len)
    targetScope.synthDecl(list.at(e++));
};
