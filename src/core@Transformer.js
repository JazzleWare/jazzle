this.y = function(n) {
  return this.inGen ? y(n) : 0;
};

this.allocTemp = function() {
  var id = newTemp(this.currentScope.allocateTemp());
  return id;
};

this.releaseTemp = this.rl = function(id) {
  this.currentScope.releaseTemp(id.name);
};

this.transform = this.tr = function(n, list, isVal) {
  var ntype = n.type;
  switch (ntype) {
    case 'Identifier':
    case 'Literal':
    case 'This':
    case 'Super':
    case 'ArrIterGet':
    case 'Unornull':
    case 'ObjIterGet':
    case 'SpecialIdentifier':
    case 'SynthSequenceExpression':
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
