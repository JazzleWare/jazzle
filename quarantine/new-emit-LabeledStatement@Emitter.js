Emitters['LabeledStatement'] =
function(n, flags, isStmt) {
  this.writeIDName(n.label.name);
  this.w(':').onw(wcb_afterStmt);
  var u = {v: false};
  this.wcbUsed = u;
  if (n.body) this.emitStmt(n.body, false);
  u.v || this.clear_onw();
};
