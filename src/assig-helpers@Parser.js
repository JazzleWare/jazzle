this .ensureSimpAssig_soft = function(head) {
  switch(head.type) {
  case 'Identifier':
    if ( this.scope.insideStrict() && arorev(head.name) )
      this.err('assig.to.arguments.or.eval');

  case 'MemberExpression':
    return true ;

  default:
    return false ;

  }
};

this.ensureSpreadToRestArgument_soft = function(head) {
  return head.type !== 'AssignmentExpression';
};


