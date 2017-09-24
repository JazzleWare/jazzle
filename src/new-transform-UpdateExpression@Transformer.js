Transformers['UpdateExpression'] =
function(n, isVal) {
  var arg = this.trSAT(n.argument);
  n.argument = arg;
  if (isResolvedName(arg)) {
    arg.target.ref.assigned();
    var leftsig = false;
    if (this.needsCVLHS(arg.target)) {
      this.incNS();
      this.active1if2(arg.target, this.curAT);
      arg.cv = true; this.cacheCVLHS(arg.target);
      leftsig = true;
    }
    if (arg.target.isRG()) {
      n = this.synth_GlobalUpdate(n, true);
      leftsig = true;
    }
    leftsig || arg.tz || this.active1if2(this.curAT, arg.target ); 
  }

  return n;
};
