this.emitHead_temps =
function(scope) {
  var temps = scope.getLG('<t>'), e = 0, len = temps.length();
  if (len > 0) {
    this.w('var').s();
    while (e < len) {
      e && this.w(',').s();
      this.w(temps.at(e++).synthName);
    }
  }
  return this;
};

this.emitHead_vars =
function(scope) {
  var list = scope.defs, e = 0, len = list.length(); 
};
