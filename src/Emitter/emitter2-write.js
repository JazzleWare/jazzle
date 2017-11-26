  import {ASSERT, STRING_TYPE, ETK_NONE, ETK_NL} from '../other/constants.js';
  import {cls} from './cls.js';

cls.writeToCurrentLine_checked =
function(rawStr) {
  ASSERT.call(this, arguments.length === 1, 'write must have only one single argument');

  ASSERT.call(this, typeof rawStr === STRING_TYPE, 'str' );
  ASSERT.call(this, rawStr.length, 'writing ""' );

  var srcLoc = this.pendingSrcLoc;
  if (srcLoc) { this.pendingSrcLoc = null; }

  if (this.hasPendingSpace())
    this.effectPendingSpace(rawStr.length);

  var curEmCol = this.emcol_cur;
  if (curEmCol && this.ol(rawStr.length) > 0)
    this.wrapCurrentLine();

  if (this.guard) {
    var tt = this.ttype;
    tt === ETK_NONE || this.nott();
    this.runGuard(rawStr, tt);
    if (this.hasPendingSpace())
      this.effectPendingSpace(rawStr.length);
  }
  else 
    this.ttype === ETK_NONE || this.nott();

  ASSERT.call(this, this.guard === null, 'guard' );
  this.ensureNoSpace();

  srcLoc && this.refreshTheCurrentLineLevelSourceMapWith(srcLoc);

  this.writeToCurrentLine_raw(rawStr);
};

cls.writeToCurrentLine_raw =
function(rawStr) {
  this.emcol_cur += rawStr.length;
  this.curLine += rawStr;
};

cls.writeToCurrentLine_space =
function() {
  this.ensureNoSpace();
  if (this.guard) this.runGuard(' ', ETK_NONE);

  ASSERT.call(this, this.guard === null, 'no');
  this.ensureNoSpace();

  this.writeToCurrentLine_raw(' ');
};

cls.writeToCurrentLine_virtualLineBreak =
function() {
  this.ensureNoSpace();
  this.guard && this.runGuard('\n', ETK_NL);
};


