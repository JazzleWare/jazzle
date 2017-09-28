this.enter = 
function(relPath) {
  var ll = { uri: this.curURI, dir: this.curDir };
  var man = this.pathMan;

  this.curURI = man.joinRaw(this.curDir, relPath);
  this.curDir = man.head(this.curURI);

  return ll;
};

this.setURIAndDir =
function(uri, dir) {
  this.curURI = uri;
  this.curDir = dir;
};

this.save =
function(n) {
  this.resolver.save(this.curURI, n);
};

this.getExistingSourceNode =
function() {
  return this.resolver.loadCached(this.curURI);
};

this.loadNewSource =
function() {
  ASSERT.call(this, !this.resolver.hasInCache(this.curURI), 'incache');
  var n = this.resolver.loadNew(this.curURI);
  this.resolver.cache(this.curURI, n);
  n['#imports'] = n['#scope'].satisfyWithBundler(this);
  this.freshSources.push(n);
  return n;
};
