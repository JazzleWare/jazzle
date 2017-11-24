
this.parsePat_array = 
function() {
  if (this.v <= 5)
    this.err('ver.patarr');

  var c0 = this.c0, loc0 = this.loc0(),
      elem = null, list = [];

  if (this.scope.insideArgs())
    this.scope.enterUniqueArgs();

  var y = 0, cb = {};

  this.suc(cb, 'bef');
  this.next();

  cb.holes = [];
  while (true) {
    elem = this.parsePat();
    if (elem && this.peekEq())
      elem = this.parsePat_assig(elem);
    else if (this.lttype === TK_ELLIPSIS) {
      list.push(elem = this.parsePat_rest());
      this.spc(elem, 'aft');
      break ;
    }  

    if (elem) {
      y += this.Y(elem);
      this.spc(elem, 'aft');
    } else 
      this.commentBuf && cb.holes.push([list.length, this.cc()]);

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
    '#y': y, '#c': cb
  };

  this.suc(cb, 'inner');
  if (!this.expectT(CH_RSQBRACKET))
    this.err('pat.array.is.unfinished');

  return n;
};

