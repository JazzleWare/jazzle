this.setCVTZ =
function(cvtz) {
  var l = this.cvtz;
  this.cvtz = cvtz;
  return l;
};

this.setRR =
function(reachedRef) {
  var rr = this.reachedRef;
  this.reachedRef = reachedRef;
  return rr;
};

this.setScope =
function(scope) {
  var cur = this.cur;
  this.cur = scope ;
  if (this.cur) this.cur.inUse = true;
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
function(n, isVal) {
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

  return transformer.call(this, n, isVal);
};

this.rename =
function(base, i) { return this.renamer(base, i); };

this.setAT =
function(v) {
  var at = this.curAT;
  this.curAT = v;
  return at;
};

this.set_activeIfScope = this.setAS =
function(v) {
  var ais = this.activeIfScope;
  this.activeIfScope = v;
  return ais;
};

this.set_activeIfNames = this.setAN =
function(v) {
  var names = this.activeIfNames;
  this.activeIfNames = v;
  return names;
};

this.rec_activeIfName = this.recAN =
function(decl) {
  var list = this.activeIfNames;
  if (list === null)
    list = this.activeIfNames = new SortedObj();
  else if (list.has(decl.ai))
    return false;

  list.set(decl.ai, decl );
  return true;
};

this.tryMarkActive =
function(scod) {
  if (this.activeIfScope)
    this.active1if2(scod, this.curAT);
  else if (this.activeIfNames) {
    var list = this.activeIfNames, len = list.length();
    var e = 0;
    while (e < len) 
      this.active1if2(scod, list.at(e++));
  }
};

this.active1if2 =
function(a,b) {
  var aIf = a.activeIf;
  if (aIf === null)
    aIf = a.activeIf = new SortedObj();
  else if (aIf.has(b.ai)) {
    ASSERT.call(this, b === aIf.get(b.ai), 'not' );
    return false;
  }

  aIf.set(b.ai, b);
  return true;
};

this.setNS =
function(v) {
  var ns = this.curNS;
  this.curNS = v;
  return ns;
};

this.incNS =
function() { return ++this.curNS; };
