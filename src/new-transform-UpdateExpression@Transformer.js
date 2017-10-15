Transformers['UpdateExpression'] =
function(n, isVal) {
  var arg = this.trSAT(n.argument);
  n.argument = arg;
  if (isResolvedName(arg)) {
    tg(arg).ref.assigned();
    var leftsig = false;
    if (this.needsCVLHS(tg(arg))) {
      arg.cv = true;
      this.cacheCVLHS(tg(arg));
    }
    if (tg(arg).isRG())
      n = this.synth_GlobalUpdate(n, true);
  }

  return n;
};
