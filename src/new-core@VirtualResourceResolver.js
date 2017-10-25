this.asNode =
function(uri) {
  ASSERT.call(this, this.has(uri), 'resource not found ('+uri+')');
  var newParser = new Parser(this.fsMap[_m(uri)], {sourceType: 'module'});
  newParser.bundleScope = this.bundleScope;
  return newParser.parseProgram();
};

this.has =
function(uri) { return HAS.call(this.fsMap, _m(uri)); };

this.set =
function(uri, value) {
  ASSERT.call(this, !this.has(uri), 'has' );
  this.fsMap[_m(uri)] = value;
};


