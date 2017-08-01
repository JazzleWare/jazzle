this.regPattern =
function() {
  var c0 = this.c, li0 = this.li, col0 = this.col;
  var l = this.resetLastRegexElem();
  var branches = null, elem = this.regBranch();
  if (this.regErr)
    return null;

  branches = [];
  if (this.expectChar(CH_OR)) {
    branches.push(elem)
    do {
      elem = this.regBranch();
      if (this.regErr)
        return null;
      branches.push(elem);
      this.resetLastRegexElem();
    } while (this.expectChar(CH_OR));
  }
  else if (elem)
    branches.push(elem);
  
  var startLoc = branches.length && branches[0] ? branches[0].loc.start : { line: li0, column: col0 };
  var lastElem = branches.length ? branches[branches.length-1] : null;
  var endLoc = lastElem ? lastElem.end.loc : this.loc();

  this.lastRegexElem = l;

  return {
    type: '#Regex.Main',
    branches: branches,
    start: c0,
    end: lastElem ? lastElem.end : this.c, // equal either way, actually
    loc: { start: startLoc, end: endLoc }
  };
};

this.regDot =
function() {
  var c0 = this.c, loc0 = this.loc();
  this.setsimpoff(c0+1);
  return {
    type: '#Regex.Dot',
    start: c0,
    loc: { start: loc0, end: this.loc() },
    end: this.c
  };
};
