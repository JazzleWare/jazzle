this.setCVTZ =
function(cvtz) {
  var l = this.cvtz;
  this.cvtz = cvtz;
  return l;
};

this.setRR =
function(reachedRef) {
  var reachedRef = this.reachedRef;
  this.reachedRef = reachedRef;
  return reachedRef;
};

this.setScope =
function(scope) {
  var cur = this.cur;
  this.cur = scope ;
  return cur;
};

this.setTS =
function(ts) {
  var ts0 = this.tempStack;
  this.tempStack = ts;
  return ts0;
};

this.setThis =
function(thisState) {
  var th = this.thisState;
  this.thisState = thisState;
  return th;
};

this.tr =
function(n, ownerBody, isVal) {
  var ntype = n.type;
  switch (ntype) {
  case 'EmptyStatement':
  case '#Untransformed':
  case 'Literal':
    return n;
  }

  var transformer = null;
  if (HAS.call(Transformers, ntype))
    transformer = Transformers[ntype];

  if (transformer === null)
    throw new Error('could not find <'+ntype+'>-transformer');

  return transformer.call(this, n, ownerBody, isVal);
};
