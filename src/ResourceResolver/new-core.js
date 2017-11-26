  import {HAS, ASSERT} from '../other/constants.js';
  import {_m} from '../other/scope-util.js';
  import {cls} from './ctor.js';

// TODO: fetch nodes based on id's, such that, in case the uri's 'a/b' and 'l/e' both point to the same file on a disk, and we have only saved 'a/b', this.get('l/e') returns the 
// same node saved under 'a/b' (by the way, this is more of a bundler's job than a resource loader's)

cls.hasInCache =
function(uri) {
  return HAS.call(this.savedNodes, _m(uri));
};

cls.loadCached =
function(uri) {
  var mname = _m(uri);
  return HAS.call(this.savedNodes, mname) ?
    this.savedNodes[mname] : null;
};

cls.cache =
function(uri, n) {
  var mname = _m(uri);
  ASSERT.call(this, !this.hasInCache(uri), 'existing');
  this.savedNodes[mname] = n;
};

cls.loadNew =
function(uri) {
  ASSERT.call(this, !this.hasInCache(uri), 'existing');
  return this.asNode(uri);
};


