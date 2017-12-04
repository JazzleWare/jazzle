
var inject = function(jazzle) {
var ResourceResolver = jazzle.ResourceResolver; // from '../ResourceResolver/cls.js';

function ASSERT(cond, m) {
  if (!cond) throw new Error(m);
}

function FileResourceResolver(fs) {
  ResourceResolver.call(this);
  this.fs = fs;
}

var RRcls = ResourceResolver.prototype;
function thuporCwath() {}
thuporCwath.prototype = RRcls;

var cls = FileResourceResolver.prototype = new thuporCwath();

function normalize(str) {
  var list = [], start = 0, len = 0, manp = new jazzle.PathMan();
  while (true) {
    len = manp.len(str, start);
    if (len === 0) 
      break;
    var elem = manp.trimSlash(str.substr(start, len));
    if (elem === '..') list.pop();
    else { list.push(elem); }
    start += len;
  }
  return list.join('/');
};

cls.asNode =
function(uri) {
  uri = normalize(uri);
  var src = this.fs.readFileSync(uri, 'utf-8').toString();
  var newParser = new jazzle.Parser(src, {sourceType: 'module'});
  newParser.bundleScope = this.bundleScope;
  var n = newParser.parseProgram();
  n['#scope']['#uri'] = uri;
  n['#scope']['#loader'] = "";
  return n;
}

cls.hasInCache =
function(uri) {
  uri = normalize(uri);
  return RRcls.hasInCache.call(this, uri);
};

cls.loadCached =
function(uri) {
  uri = normalize(uri);
  return RRcls.loadCached.call(this, uri);
};

cls.cache =
function(uri, n) {
  uri = normalize(uri);
  return RRcls.cache.call(this, uri, n);
};

cls.loadNew =
function(uri) {
  uri = normalize(uri);
  return RRcls.loadNew.call(this, uri);
};

 return FileResourceResolver;
};

 module.exports.inject = inject;
