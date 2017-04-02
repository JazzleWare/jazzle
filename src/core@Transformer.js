this.y = function(n) {
  return this.inGen ? y(n) : 0;
};

this.transform = this.tr = function(n, list, isVal) {
  var ntype = n.type;
  switch (ntype) {
    case 'Literal':
    case 'This':
    case 'Super':
    case 'ArrIterGet':
    case 'Unornull':
    case 'ObjIterGet':
    case 'SpecialIdentifier':
    case '#Sequence':
    case '#Untransformed':
    case '#ResolvedName':
      return n;
    default:
      return transform[n.type].call(this, n, list, isVal);
  }
};

this.rlit = function(id) { isTemp(id) && this.rl(id); };

this.save = function(n, list) {
  var temp = this.allocTemp();
  push_checked(synth_assig(temp, n), list);
  return temp;
};

this.setScope = function(scope) {
  var currentScope = this.currentScope;
  this.currentScope = scope;
  return currentScope;
};
