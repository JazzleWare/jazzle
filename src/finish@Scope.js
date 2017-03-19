this.finish = function() {
  this.handOverRefsToParent();
};

this.handOverRefsToParent = function() {
  var list = this.refs.keys, i = 0;
  while (i < list.length) {
    var ref = this.refs.at(i);
    if (!ref.resolved)
      this.handOver_m(list[i], ref);
    i++ ;
  }
};
