this.parseEmptyStatement =
function() {
  var n = {
    type: 'EmptyStatement',
    start: this.c0,
    loc: { start: this.loc0(), end: this.loc() },
    end: this.c,
    '#y': 0
  };
  this.next();
  return n;
};
