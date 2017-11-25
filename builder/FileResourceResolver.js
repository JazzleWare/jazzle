var jazzle = require('../dist/jazzle.js');
var ResourceResolver = jazzle.ResourceResolver;
var fs = require('fs');
var Parser = jazzle.Parser;

function ASSERT(condition, message) {
  if (!condition)
    throw new Error(message);
}

function FileResourceResolver() {
  ResourceResolver.call(this);
}

function thuporCwath() {}

var RRcls = ResourceResolver.prototype;
thuporCwath.prototype = RRcls;
var cls = FileResourceResolver.prototype = new thuporCwath();

var normalize = function normalize(str) {
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
  var src = fs.readFileSync(uri, 'utf-8').toString();
  var newParser = new Parser(src, {sourceType: 'module'});
  newParser.bundleScope = this.bundleScope;
  return newParser.parseProgram();
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

 module.exports.FileResourceResolver = FileResourceResolver;
