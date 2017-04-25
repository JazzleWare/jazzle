this.read_dot =
function() {
  var ch = this.scat(this.c+1);
  if (ch === CH_SINGLEDOT)
    return this.readEllipsis();
  
  this.readNum_tail(FL_HEADLESS_FLOAT);

  this.ltval = parseFloat(this.ltraw = this.c0_to_c());
  this.lttype = TK_NUM;
};
