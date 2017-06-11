this.trListChunk =
function(list, isVal, s, e) {
  while (s<=e) {
    list[s] = this.tr(list[s], isVal);
    s++ ; 
  }
};

this.trSAT =
function(n, isVal) {
  switch (n.type) {
  case 'Identifier':
    return this.toResolvedName(n, 'sat');
  case 'MemberExpression':
    return this.trSAT_mem(n);
  }
  ASSERT.call(this, false, 'SAT !== <'+n.type+'>');
};

this.accessTZ =
function(scope) {
  var lg = scope.scs.gocLG('tz');
  var l = lg.getL(0);
  if (!l) {
    l = lg.newL();
    l.name = 'tz';
    lg.seal();
  }
  return l.track(this.cur);
};

this.accessJZ =
function() {
  return;
  var lg = this.scriptScope.gocLG('jz');
  var l = lg.getL(0);
  if (!l) {
    l = lg.newL();
    lg.seal();
  }
  return l.track(this.cur);
};

this.trList =
function(list, isVal) {
  return this.trListChunk(list, isVal, 0, list.length-1) ;
};
