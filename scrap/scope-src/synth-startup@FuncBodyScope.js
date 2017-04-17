this.startupSynthesis = function() {
  this.bootSynthesis();
  var list = this.funcHead.refs,
      i = 0,
      len = list.length(),
      elem = null;

  while (i < len) {
    elem = list.at(i++);
    if (this.funcHead.hasSignificantRef(elem))
      this.trackSynthName(elem.getDecl().synthName);
  }

//list = this.refs, i = 0, len = list.length();
//while (i < len) {
//  elem = list.at(i++);
//  if (this.hasSignificantRef(elem))
//    this.trackSynthName(elem.getDecl().synthName);
//}
};
