Emitters['ArrayExpression'] = function(n, prec, flags) {
  var list = n.elements, i = 0;
  var si = spreadIdx(list, 0);
  if (si !== -1)
    return this.emitArrayWithSpread(list, flags, si);

  this.w('[');
  this.emitArrayChunk(list, 0, list.length-1);
  this.w(']');
};

this.emitArrayWithSpread = function(list, flags, si) {
  var paren = flags & EC_NEW_HEAD;
  if (paren) this.w('(');
  this.wm('jz','.','concat','(')
  var startChunk = 0;
  while (si !== -1) {
    if (startChunk > 0)
      this.wm(',',' ');
    if (si > startChunk) {
      this.w('[');
      this.emitArrayChunk(list, startChunk, si-1);
      this.wm(']',',',' ');
    }
    this.eN(list[si].argument);
    startChunk = si + 1;
    si = spreadIdx(list, startChunk);
  }
  if (startChunk < list.length) {
    if (startChunk > 0) this.wm(',',' ');
    this.w('[').emitArrayChunk(list, startChunk, list.length-1); 
    this.w(']');
  }
  this.w(')');
  if (paren) this.w(')');
};

this.emitArrayChunk = function(list, from, to) {
  var i = from;
  while (i <= to) {
    if (i !== from) this.wm(',',' ');
    var elem = list[i];
    if (elem === null) this.w('void 0');
    else this.eN(elem, PREC_NONE, EC_NONE);
    i++;
  }
};
