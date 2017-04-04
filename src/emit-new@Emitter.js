Emitters['NewExpression'] = function(n, prec, flags) {
  this.wm('new',' ').emitNewHead(n.callee);
  this.w('(').emitArgList(n.arguments);
  this.w(')');
};

this.emitArgList = function(argList) {
  var i = 0;
  while (i < argList.length) {
    if (i>0) this.w(',',' ');
    this.eN(argList[i], false, EC_NONE);
    i++;
  }
};
