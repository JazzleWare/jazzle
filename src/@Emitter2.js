function Emitter2() {
  this.indentCache = [""];
  this.indentString = ' ';
  this.indentLevel = 0;

  this.wrapLimit = 0;

  this.curLineIndent = 0;
  this.curLine = "";
  this.hasLeading = false;
  this.needsLeading = false;
  this.finishingLine = false;

  this.pendingSpace = SP_NONE;
  this.nextLineIndent = 0;

  this.guard = null;
  this.guardArg = null;
  this.guardListener = null;
  this.defaultGuardListener = {v: false};
  this.runningGuard = false;

  this.tt = ETK_NONE;

  // <sourcemap-related>
  this.emcol_cur = 0;
  this.emcol_latestRec = 0;

  this.emline_cur = 0;
  this.emline_latestRec = 0;

  this.srci_cur = -1;
  this.srci_latestRec = -1;

  this.namei_cur = -1;
  this.namei_latestRec = -1;

  this.loc_latestRec = {line: 1, column: 0};

  this.sm = "";
  this.lm = "";

  this.ln_srci_vlq = "";
  this.ln_loc_vlq = "";
  this.ln_namei_vlq = "";
  this.ln_emcol_cur = 0;

  this.pendingSrcLoc = null;

//this.lineSMState = SM_LINE_NEEDS_NO_LINKPOINT;
  this.mustHaveLinkpoint = false;
  this.hasRecordedLinkpoint = false;

  this.smNameList = new SortedObj();
  this.smSrcList = new SortedObj();
  // </sourcemap-related>

  this.allow = { space: true, nl: true, comments: { l: true, m: true }, elemShake: false };
  this.out = "";
  this.outActive = false;

  this.jzcalls = new SortedObj();
}
