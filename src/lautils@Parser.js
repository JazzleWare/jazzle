this.expectT =
function(lttype) {
  if (this.lttype === lttype) {
    this.next();
    return true;
  }
  return false;
};

this.rw =
function(c,li,col,luo) { this.c = c; this.li = li; this.col = col; this.luo = luo; };
