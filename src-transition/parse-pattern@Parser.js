this.parsePat = 
function() {
  switch (this.lttype) {
  case TK_ID:
    this.validate(this.ltval);
    var id = this.id();
    this.declare(id);
    if (this.scope.insideStrict() && arguments_or_eval(id.name))
      this.err('bind.arguments.or.eval');

    return id;

  case CH_LSQBRACKET:
     return this.parsePat_array();

  case CH_LCURLY:
     return this.parsePat_obj();

  default:
     return null;
  }
};
