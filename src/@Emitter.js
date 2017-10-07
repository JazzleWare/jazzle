function Emitter() {
  this.indentCache = [];
  this.indentLevel = 0;
  this.indentString = '  ';
  this.wrapLimit = 0;
  this.curLine = "";
  this.curLineIndent = this.indentLevel;
  this.curtt = ETK_NONE;
  this.pendingSpace = EST_NONE;
  this.guard = null;
  this.guardArg = null;
  this.guardListener = null;
  this.allow = { space: true, nl: true, comments: { l: true, m: true }, elemShake: false };
  this.rll = 0; // real line length; TODO: eliminate need for it
  this.wrapLine = false;
  this.locw = null;

  // <sourceMapVar>
  this.smNameList = new SortedObj();
  this.smSrcList = new SortedObj();

  this.lineIsLn = false;
  this.ln = false;

  this.emcol_cur = 0; // rll?
  this.emcol_latestRec = 0;

  this.emline_cur = 0;
  this.emline_latestRec = 0;

  this.srci_cur = 0;
  this.srci_latestRec = 0;

  this.namei_cur = -1;
  this.namei_latestRec = 0;

  this.loc_latestRec = {line: 1, column: 0};

  this.ln_srci_vlq = "";
  this.ln_loc_vlq = "";
  this.ln_namei_vlq = "";

  this.ln_emcol_cur = 0;

  this.lm = ""; // sourcemap -- line
  this.sm = ""; // sourcemap -- whole
  // </sourceMapVar>

  this.jzcalls = new SortedObj();

  this.out = "";
}
