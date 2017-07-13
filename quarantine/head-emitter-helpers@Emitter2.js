this.emitHead_temps =
function(scope, isScript) {
  var temps = scope.getLG('<t>'), e = 0, len = temps.length();
  while (e < len) {
    this.w(e ? ',' : 'var').s();
    this.w(temps.at(e++).synthName);
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
    if (v.isVar() && v.isFn()) {
      this.w(em ? ',' : 'var').s().w(v.synthName);
      em++;
    }
  }
  em && this.w(';');
};

this.emitHead_fns =
function(scope, isScript) {
  var list = scope.funLists, e = 0, len = list.length();
  var onw = this.hasOnW(), em = 0;
  while (e < len) {
    this.emitFunList(list.at(e++));
    if (onw && !this.hasOnW()) {
      ++em;
      this.onW(onW_line);
      onw = this.hasOnW();
    }
  }
  em && this.hasOnW() && this.clearOnW();
};

this.emitHead_llinosa =
function(scope, isScript) {
  var list = scope.defs, e = 0, len = list.length();
  var em = 0, item = null;
  while (e < len) {
    item = list.at(e++ );
    if (item.isLLINOSA()) {
      this
        .w(em ? ',' : 'var').s().w(item.synthName)
        .s().w('=').s()
        .wm('{','v',':','void',' ','0','}');
      ++em
    }
  }
  if (e > 0) this.w(';');
};
