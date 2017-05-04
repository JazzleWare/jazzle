this.expectT =
function(lttype) {
  if (this.lttype === lttype) {
    this.next();
    return true;
  }
  return false;
};
