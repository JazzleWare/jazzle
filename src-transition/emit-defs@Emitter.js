this.emitDefs = function(defs) {
  var len = defs.length(), i = 0;
  this.w('var').s();
  while (i < len) {
    i && this.w(',').s();
    var elem = defs.at(i++);
    this.w(elem.synthName);
    if (elem.isLexical() && elem.ref.scope.insideLoop() && elem.ref.indirect)
      this.wm(' ','=',' ','{','v',':',' ','void',' ','0','}');
  }
  this.w(';');
};
