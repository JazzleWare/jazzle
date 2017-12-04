  import {ASSERT, ETK_NL} from '../other/constants.js';
  import {cls} from './cls.js';

cls.wrapCurrentLine =
function() {
  this.hasPendingSpace() && this.removePendingSpace();
  this.nextLineHasLineBreakBefore = true;

  if (this.lineBlank()) {
    if (this.guard) {
      ASSERT.call(this, !this.curLineHasLineBreakBefore, 'leading guard');
      this.runGuard('\n', ETK_NL);
    }
    this.startFreshLine();
  }
  else this.finishCurrentLine();
};

cls.overflowLength =
cls.ol =
function(len) {
  var wl = this.wrapLimit;
  return wl <= 0 ? 0 : this.emcol_cur + len - wl;
};


