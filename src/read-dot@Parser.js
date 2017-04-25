this.read_dot =
function() {
  var ch = this.scat(this.c+1);
  if (ch === CH_SINGLEDOT)
    return this.readEllipsis();
  
  this.readNum_floatTail(FL_NONE);
  this.lttype = TK_NUM;
};
