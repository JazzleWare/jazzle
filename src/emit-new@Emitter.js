Emitters['NewExpression'] = function(n, prec, flags) {
  this.wm('new',' ').eH(n.callee, PREC_NONE, EC_NEW_HEAD);
  this.w('(').emitArgList(n.arguments);
  this.w(')');
};

this.emitArgList = function(argList) {
  var i = 0;
  while (i < argList.length) {
    if (i>0) this.w(',',' ');
    this.eN(argList[i], PREC_NONE, EC_NONE);
    i++;
  }
};
