Emitters['SpecialIdentifier'] = function(n, prec, flags) {
  switch (n.kind) {
  case 'tempVar':
    return this.writeIdentifierName(n.name);
  case 'unornull':
    this.wm('jz','.','uon');
    return;
  default:
    this.writeIdentifierName(n.kind);
    return;
  }
};
