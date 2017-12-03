  import {HAS, ETK_DIV, ETK_COMMENT, ETK_NL} from '../other/constants.js';
  import {wcb_afterLineComment} from '../other/wcb.js';
  import {cls} from './cls.js';

cls.emc =
function(cb, i) {
  if (HAS.call(cb, i)) {
    var e = cb[i];
    cb[i] = null;
    return this.emcim(e);
  }
  return false;
};

cls.emce = // emc erase
function(cb, i) {
  if (this.emc(cb, i)) {
    cb[i] = null;
    return true;
  }
  return false;
};

cls.emcim =
function(comments) { // emc -- immediate
  if (comments === null)
    return false;

  var list = comments.c, nl = comments.n, e = 0, l = null;
  while (e < list.length) {
    var elem = list[e];
    var resume = elem.type === 'Line' ?
      this.allow.comments.l : this.allow.comments.m;

    if (resume) {
      if (l) {
        if (l.type === 'Line' || l.loc.end.line < elem.loc.start.line)
          this.l();
      }
      l = elem;

      var wflag = ETK_DIV|ETK_COMMENT;
      if (e === 0 && nl)
        wflag |= ETK_NL;

      if (elem.type === 'Line') {
        this.wt('//', wflag).writeToCurrentLine_raw(elem.value);
      }
      else {
        this.wt('/*', wflag);
        this.writeToCurrentLine_raw(elem.value);
        this.writeToCurrentLine_raw('*/');
      }
    }

    e++;
  }

  if (l && l.type === 'Line') {
    this.nextLineHasLineBreakBefore = true;
    this.gu(wcb_afterLineComment);
  }

  return true;
};


