this.parsePattern = function() {
  switch ( this.lttype ) {
    case 'Identifier' :
       var id = this.validateID("");
       this.declare(id);
       if (this.scope.insideStrict() && arguments_or_eval(id.name))
         this.err('bind.arguments.or.eval');

       return id;

    case '[':
       return this.parseArrayPattern();
    case '{':
       return this.parseObjectPattern();

    default:
       return null;
  }
};


