this.asNode =
function(uri) {
  ASSERT.call(this, this.has(uri), 'resource not found ('+uri+')');
  var e = new Parser(this.fsMap[_m(uri)], {sourceType: 'module'}).parseProgram();
  return e;
};

this.has =
function(uri) { return HAS.call(this.fsMap, _m(uri)); };

this.set =
function(uri, value) {
  ASSERT.call(this, !this.has(uri), 'has' );
  this.fsMap[_m(uri)] = value;
};


