function Emitter() {
  this.indentCache = [];
  this.indentLevel = 0;
  this.indentString = '  ';
  this.wrapLimit = 0;
  this.curLine = "";
  this.curLineIndent = this.indentLevel;
  this.curtt = ETK_NONE;
  this.pendingSpace = EST_NONE;
  this.wcb = null;
  this.wcbp = null;
  this.wcbUsed = null;
  this.allow = { space: true, nl: true, comments: { l: true, m: true } };

  this.out = "";
}
