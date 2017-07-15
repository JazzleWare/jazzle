this.emitHead_temps =
function(scope, isScript) {
  var temps = scope.getLG('<t>'), e = 0, len = temps.length();
  while (e < len) {
    e ? this.wm(',','') : this.w('var').onw(wcb_afterVar);
    this.wt(temps.at(e++).synthName, ETK_ID);
  }
  e && this.w(';');
  return this;
};

this.emitHead_vars =
function(scope, isScript) {
  var vars = scope.defs, e = 0, len = vars.length(); 
  var em = 0, v = null;
  while (e < len) {
    v = vars.at(e++);
    if (v.isVar() && !v.isFn()) {
      em ? this.wm(',','') : this.w('var').onw(wcb_afterVar);
      this.wt(v.synthName, ETK_ID);
      em++;
    }
  }
  em && this.w(';');
};

this.emitHead_fns =
function(scope, isScript) {
  var list = scope.funLists, e = 0, len = list.length();
  var onw = this.wcb, em = 0;
  while (e < len) {
    this.emitFunList(list.at(e++));
    if (onw && !this.wcb) {
      ++em;
      this.onW(wcb_afterVar);
      onw = this.wcb;
    }
  }

  em && this.wcb && this.clear_onw();
};

this.emitHead_llinosa =
function(scope, isScript) {
  var list = scope.defs, e = 0, len = list.length();
  var em = 0, item = null;
  while (e < len) {
    item = list.at(e++ );
    if (item.isLLINOSA()) {
      em ? this.wm(',','') : this.w('var').onw(wcb_afterVar);
      this.wt(item.synthName, ETK_ID).os().w('=').os()
        .wm('{','v',':','void',' ','0','}');
      ++em
    }
  }
  if (em > 0) this.w(';');
};
