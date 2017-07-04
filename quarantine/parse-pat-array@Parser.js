this.parsePat_array = 
function() {
  if (this.v <= 5)
    this.err('ver.patarr');

  var c0 = this.c0, loc0 = this.loc0(),
      elem = null, list = [];

  if (this.scope.insideArgs())
    this.scope.enterUniqueArgs();

  var y = 0;

  this.next();
  while (true) {
    elem = this.parsePat();
    if (elem && this.peekEq())
      elem = this.parsePat_assig(elem);
    else if (this.lttype === TK_ELLIPSIS) {
      list.push(this.parsePat_rest());
      break ;
    }  

    if (elem) y += this.Y(elem);

    if (this.lttype === CH_COMMA) {
      list.push(elem);
      this.next();
    } else  {
      elem && list.push(elem);
      break ;
    }
  }

  var n = {
    type: 'ArrayPattern',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    elements: list,
    '#y': y
  };

  if (!this.expectT(CH_RSQBRACKET))
    this.err('pat.array.is.unfinished');

  return n;
};
