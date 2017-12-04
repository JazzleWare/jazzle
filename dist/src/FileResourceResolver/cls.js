import Parser from '../Parser/cls.js';
import {ASSERT} from '../other/constants.js';
import {createObj} from '../other/util.js';
import PathMan from '../PathMan/cls.js';
import ResourceResolver from '../ResourceResolver/cls.js';

export default function FileResourceResolver(fs) {
  ResourceResolver.call(this);
  this.fs = fs;
}

var RRcls = ResourceResolver.prototype;
var cls = FileResourceResolver.prototype = createObj(RRcls);

function normalize(str) {
  var list = [], start = 0, len = 0, manp = new PathMan();
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
  var newParser = new Parser(src, {sourceType: 'module'});
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
