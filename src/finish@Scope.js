this.finish = function() {
  this.handOverRefsToParent(this.refs);
  this.handOverRefsToParent(this.liquidRefs);
};

this.handOverRefsToParent = function(refs) {
  var list = refs.keys, i = 0;
  while (i < list.length) {
    var ref = refs.at(i);
    if (!ref.resolved)
      this.handOver_m(list[i], ref);
    i++ ;
  }
};
