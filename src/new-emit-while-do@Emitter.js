Emitters['DoWhileStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.wm('do',' ','{').i().wsl();
  this.emitAny(n.body, EC_START_STMT, true ) ?
    this.wsl() : this.csl();
  this.u().wm('}',' ','while',' ','(').eA(n.test, EC_NONE, false).wm(')',';');
  return true;
};
