this.finish = function() {
  this.tailI = this.iRef.v-1;
  this.handOverRefsToParent();
};

this.handOverRefsToParent = function() {
  var list = this.refs.keys, i = 0;
  while (i < list.length) {
    var ref = this.refs.at(i);
    if (!ref.resolved)
      this.parent.receiveRef_m(list[i], ref);
    i++ ;
  }
};
