Emitters['UnaryExpression'] = 
function(n, flags, isStmt) {
  var lastChar = this.code.charAt(this.code.length-1) ;
  var o = n.operator;
  lastChar === o && this.s();
  this.w(o);
  this.emitUA(n.argument);
  return true;
};

this.emitUA = function(n) {
  switch (n.type) {
  case 'UnaryExpression':
  case 'UpdateExpression':
    return this.emitAny(n, EC_NONE, false);
  }
  return this.emitHead(n, EC_NONE, false);
};
