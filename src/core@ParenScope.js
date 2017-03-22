this.dissolve = function() {
  var list = this.paramList,
      i = 0,
      ref = null,
      elem = null;

  var refs = this.refs, parent = this.parent;
  list = refs.keys, i = 0;
  while (i < list.length) {
    var mname = list[i];
    parent.refDirect_m(mname, refs.get(mname));
    i++;
  }

  list = this.ch, i = 0;
  while (i < list.length)
    list[i++].parent = this.parent;
};

this.finish = function() {};
