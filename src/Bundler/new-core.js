  import {ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

// 
// a
// |__ b.js: import './l.js'
// |__ l.js: console.log('l.js in a')
//
// e
// |__ u.js -> a link to 'a/b.js'
// |__ l.js -> console.log('l.js in b')
//
// with above, consider:
// limport 'a/b.js'; limport 'e/u.js'
// 
// what is its output supposed to be?

cls.enter = 
function(relPath) {
  var ll = { uri: this.curURI, dir: this.curDir };
  var man = this.pathMan;

  var at = 0, len = -1, n = this.curDir;
  while (at < relPath.length) {
    len = man.len(relPath, at);
    var elem = relPath.substr(at, len);
    n = man.joinRaw(n, man.trimAll(elem), true );
    at += len;
  }
  this.curURI = n;
  this.curDir = man.head(this.curURI);

  return ll;
};

cls.setURIAndDir =
function(uri, dir) {
  this.curURI = uri;
  this.curDir = dir;
};

cls.save =
function(n) {
  n['#scope']['#uri'] = this.curURI;
  this.resolver.cache(this.curURI, n);
};

cls.getExistingSourceNode =
function() {
  return this.resolver.loadCached(this.curURI);
};

cls.loadNewSource =
function() {
  ASSERT.call(this, !this.resolver.hasInCache(this.curURI), 'incache');
  var n = this.resolver.loadNew(this.curURI);
  this.resolver.cache(this.curURI, n);

//n['#imports'] = n['#scope'].satisfyWithBundler(this);

  this.freshSources.push(n);
  return n;
};


