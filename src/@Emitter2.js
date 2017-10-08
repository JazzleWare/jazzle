function Emitter2() {
  this.out = "";
  this.curLine = "";
  this.nextLineIndent = 0;
  this.pendingSpace = SP_NONE;
  this.curLineIndent = 0;
  this.outActive = false;
  this.guard = null;
  this.hasLeading = false;
  this.needsLeading = false;
  this.sm = "";
  this.lm = "";
  this.ln = false;
  this.wrapLimit = 0;
  this.locw = null;
  this.emcol_cur = 0;
  this.emline_cur = 0;
  this.indentCache = [""];
  this.indentString = ' ';
  this.defaultGuardListener = {v: false};
  this.guard = null;
  this.guardArg = null;
  this.guardListener = null;
  this.tt = ETK_NONE;
  this.allow = { space: true, nl: true, comments: { l: true, m: true }, elemShake: false };
}
