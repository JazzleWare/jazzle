this.parsePat = 
function() {
  switch (this.lttype) {
  case TK_ID:
    if (this.vpatCheck) {
      this.patErrCheck();
      this.vpatCheck = false;
    }
    this.validate(this.ltval);
    var id = this.id();
    this.declare(id);
    if (this.scope.insideStrict() && arguments_or_eval(id.name))
      this.err('bind.arguments.or.eval');

    return id;

  case CH_LSQBRACKET:
    if (this.vpatCheck) {
      this.patErrCheck();
      this.vpatCheck = false;
    }
    return this.parsePat_array();

  case CH_LCURLY:
    if (this.vpatCheck) {
      this.patErrCheck();
      this.vpatCheck = false;
    }
    return this.parsePat_obj();

  default:
     return null;
  }
};
