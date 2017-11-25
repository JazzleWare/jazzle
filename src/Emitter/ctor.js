  import {SP_NONE, ETK_NONE} from '../other/constants.js';
  import SortedObj from '../SortedObj/cls.js';
  import {createObj} from '../other/util.js';
  import {Emitters} from '../other/globals.js';

function Emitter() {
  this.indentCache = [""];
  this.indentString = '  ';
  this.indentLevel = 0;

  this.wrapLimit = 0;

  this.curLineIndent = 0;
  this.curLineHasLineBreakBefore = false;
  this.curLine = "";

  this.pendingSpace = SP_NONE;

  this.nextLineIndent = 0;
  this.nextLineHasLineBreakBefore = false;

  this.finishingLine = false;

  this.guard = null;
  this.guardArg = null;
  this.guardListener = null;
  this.defaultGuardListener = {v: false};
  this.runningGuard = false;

  this.ttype = ETK_NONE;

  // <sourcemap-related>
  this.emcol_cur = 0;
  this.emcol_latestRec = 0;

  this.emline_cur = 0;
  this.emline_latestRec = 0;

  this.srci_cur = 0; // -1;
  this.srci_latestRec = 0; // -1;

  this.namei_cur = -1;
  this.namei_latestRec = -1;

  this.loc_latestRec = {line: 1, column: 0};

  this.sm = "";
  this.lm = "";

  this.ln_vlq_tail = "";
  this.ln_emcol_cur = 0;
  this.ln_emcol_latestRec = 0;

  this.pendingSrcLoc = null;

  this.hasRecorded_SMLinkpoint = false;
  this.hasRecorded_emcol_latestRec = false;

  this.smNameList = new SortedObj();
  this.smSrcList = new SortedObj();
  // </sourcemap-related>

  this.smLen = 0;
  this.smLineStart = false;

  this.outLen = 0;

  this.emitters = createObj(Emitters);
  this.allow = { space: true, nl: true, comments: { l: true, m: true }, elemShake: false };
  this.out = "";
  this.outActive = false;

  this.jzcalls = new SortedObj();
}

 export {Emitter};
 export var cls = Emitter.prototype;
