function Emitter2() {
  this.indentCache = [];
  this.indentLevel = 0;
  this.indentString = ' ';
  this.wrapLimit = 0;
  this.curLine = "";
  this.curTok = TK_NONE;
  this.pendingSpace = EPS_NONE;
  this.wcb = null;
  this.wcbp = null;
  this.out = "";
}
