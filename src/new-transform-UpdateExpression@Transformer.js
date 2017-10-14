Transformers['UpdateExpression'] =
function(n, isVal) {
  var arg = this.trSAT(n.argument);
  n.argument = arg;
  if (isResolvedName(arg)) {
    arg.target.ref.assigned();
    var leftsig = false;
    if (this.needsCVLHS(arg.target)) {
      arg.cv = true;
      this.cacheCVLHS(arg.target);
    }
    if (arg.target.isRG())
      n = this.synth_GlobalUpdate(n, true);
  }

  return n;
};
