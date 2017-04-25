this.readSurrogateTail =
function() {
  var c = this.c, s = this.src, l = s.length, mustSetOff = false;
  c >= l && this.err('unexpected.eof.while.surrogate.tail');
  var surrogateTail = s.charCodeAt(c);
  if (surrogateTail === CH_BACK_SLASH)
    surrogateTail = this.readBS();
  else
    mustSetOff = true;

  if (surrogateTail<0x0DC00 || surrogateTail>0x0DFFF)
    this.err('surrogate.tail.not.in.range');

  mustSetOff && this.setsimpoff(c+1);

  return surrogateTail;
};
