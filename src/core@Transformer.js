this.tr =
function(n, ownerBody, isVal) {
  var transformer = null;
  if (HAS.call(TransformerList, n.type))
    transformer = TransformerList[n.type];

  if (transformer === null)
    throw new Error('could not find <'+n.type+'>-transformer');

  return transformer.call(this, n, ownerBody, isVal);
};

this.setTS =
function(ts) {
  var ts0 = this.tempStack;
  this.tempStack = ts;
  return ts0;
};

this.setScope =
function(scope) {
  var cur = null;
  this.cur = scope ;
  return cur;
};
