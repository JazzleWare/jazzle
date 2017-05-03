this.findLabel_m = 
function(mname) {
  return HAS.call(this.labels, mname) ?
    this.labels[name] : null;
};

this.testStmt = 
function() {
  if (this.canBeStatement) {
    this.canBeStatement = false;
    return true;
  }
  return false;
};

this.fixupLabels =
function(isLoop) {
  if (this.unsatisfiedLabel) {
    this.unsatisfiedLabel.loop = loop;
    this.unsatisfiedLabel = null;
  }
};

this.blck = function () { // blck ([]stmt)
  var isFunc = false, stmt = null, stmts = [];
  if (this.directive !== DIR_NONE)
    this.parseDirectives(stmts);

  while (stmt = this.parseStatement(true))
    stmts.push(stmt);

  return (stmts);
};
