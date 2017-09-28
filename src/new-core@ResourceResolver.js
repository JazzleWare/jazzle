// TODO: fetch nodes based on id's, such that, in case the uri's 'a/b' and 'l/e' both point to the same file on a disk, and we have only saved 'a/b', this.get('l/e') returns the 
// same node saved under 'a/b' (by the way, this is more of a bundler's job than a resource loader's)

this.save =
function(uri, n) {
  var mname = _m(uri);
  ASSERT.call(this, !HAS.call(this.savedNodes, mname), 'existing');

  this.savedNodes[mname] = n;
};

this.get =
function(uri) {
  var mname = _m(uri);
  return HAS.call(this.savedNodes, mname) ?
    this.savedNodes[mname] : null;
};
