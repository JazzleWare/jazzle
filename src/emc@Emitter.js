this.emc =
function(cb, i) {
  HAS.call(cb, i) && this.emcim(cb[i]);
};

this.emcim =
function(comments) { // emc -- immediate
  if (comments === null)
    return;

  var list = comments.c, nl = comments.n, e = 0, l = null;

  while (e < list.length) {
    var elem = list[e];
    if (l) {
      if (l.type === 'Line' || l.loc.end.line < elem.loc.start.line)
        this.l();
    }
    else
      l = elem;

    var wflag = ETK_DIV;
    if (e === 0 && nl)
      wflag |= ETK_NL;

    if (elem.type === 'Line') {
      this.wt('//', wflag).rwr(elem.value);
    }
    else {
      this.wt('/*', wflag);
      this.rwr(elem.value);
      this.rwr('*/');
    }
    e++;
  }

  l && l.type === 'Line' && this.onw(wcb_afterLineComment);
};
