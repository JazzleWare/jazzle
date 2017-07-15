this.emc =
function(cb, i) {
  HAS.call(cb, i) && this.emcim(cb[i]);
};

this.emcim =
function(comments) {
  var list = comments.c, nl = comments.n, e = 0, l = null;
  if (nl && this.wcb)
    this.call_onw('\n', ETK_DIV);

  while (e < list.length) {
    var elem = list[e];
    if (l) {
      if (l.type === 'Line' || l.loc.end.line < elem.loc.start.line)
        this.l();
    }
    else
      l = elem;

    if (elem.type === 'Line') {
      this.rwr('//');
      this.rwr(elem.value);
    }
    else {
      this.rwr('/*');
      this.rwr(elem.value);
      this.rwr('*/');
    }
    e++;
  }

  l && l.type === 'Line' && this.onw(wcb_afterLineComment);
};
