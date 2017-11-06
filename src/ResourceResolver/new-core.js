// TODO: fetch nodes based on id's, such that, in case the uri's 'a/b' and 'l/e' both point to the same file on a disk, and we have only saved 'a/b', this.get('l/e') returns the 
// same node saved under 'a/b' (by the way, this is more of a bundler's job than a resource loader's)

this.hasInCache =
function(uri) {
  return HAS.call(this.savedNodes, _m(uri));
};

this.loadCached =
function(uri) {
  var mname = _m(uri);
  return HAS.call(this.savedNodes, mname) ?
    this.savedNodes[mname] : null;
};

this.cache =
function(uri, n) {
  var mname = _m(uri);
  ASSERT.call(this, !this.hasInCache(uri), 'existing');
  this.savedNodes[mname] = n;
};

this.loadNew =
function(uri) {
  ASSERT.call(this, !this.hasInCache(uri), 'existing');
  return this.asNode(uri);
};
