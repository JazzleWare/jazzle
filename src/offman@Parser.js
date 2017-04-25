this.setsimpoff =
function(offset) {
  this.col += (this.c = offset) - this.luo;
  // TODO: will luo remain relevant even if
  // we only use this.c at the start and end of a lexere routine
  this.luo = offset;
};

this.setnewloff =
function(offset) {
  this.luo = offset;
  this.c = offset;
  this.col = 0;
  this.li++;
};

this.autosetoff =
function(offset) {
  var ch = this.scat(offset);
  switch (ch) {
  case CH_CARRIAGE_RETURN:
  case CH_LINE_FEED:
  case 0x2028:
  case 0x2029:
    this.setnewloff(offset);
  default:
    if (ch !== -1)
      this.setsimpoff(offset);
  }
};

this.peekch =
function() {
  return this.scat(this.c);
};

this.scat =
function(offset) {
  return offset < this.src.length ?
    this.src.charCodeAt(offset) : -1;
};
