this.trListChunk =
function(list, isVal, s, e) {
  if (arguments.length < 5 || e === -1)
    e = list.length-1;
  while (s<e) {
    list[s] = this.tr(list[s], isVal);
    s++ ; 
  }
};

this.trSAT =
function(n, isVal) {
  switch (n.type) {
  case 'Identifier':
    return this.trSAT_name(n);
  case 'MemberExpression':
    return this.trSAT_mem(n);
  }
  ASSERT.call(this, false, 'SAT !== <'+n.type+'>');
};

this.trList =
function(list, isVal) {
  return this.trListChunk(list, isVal, 0, list.length-1) ;
};

this.accessTZ =
function() {};

this.accessJZ =
function() {};
