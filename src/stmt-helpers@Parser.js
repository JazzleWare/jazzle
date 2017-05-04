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

this.stmtList =
function () {
  var stmt = null, list = [];
  while (stmt = this.parseStatement(true))
    list.push(stmt);
  return list;
};
