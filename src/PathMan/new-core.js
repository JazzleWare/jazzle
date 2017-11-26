  import {CH_DIV, ASSERT} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.isSlash =
function(path, at) {
  return path.length <= at ? false : 
    path.charCodeAt(at) === CH_DIV;
};

cls.findSlash =
function(path, at) {
  ASSERT.call(this, arguments.length === 2, 'arguments');
  return path.indexOf('/', at);
};

cls.findLastSlash =
function(path, at) {
  ASSERT.call(this, arguments.length === 2, 'arguments');
  return path.lastIndexOf('/', at);
}; 

// tail(a/b) -> b; tail(a) -> ""
cls.tail =
function(path) {
  var slash = this.findLastSlash(path, path.length);
  if (slash === -1)
    return "";
  ++slash;
  return slash >= path.length ? "" : path.substring(slash);
};

// head(a/b) -> a; head(a) -> ""
cls.head =
function(path) {
  var slash = this.findLastSlash(path, path.length);
  return slash === -1 ? "" : slash === 0 ? path.charAt(0) : path.substring(0, slash);
};
 
cls.len =
function(path, start) {
  if (start >= path.length)
    return 0;
  var tail = -1;
  if (this.isSlash(path, start))
    tail = start + 1;
  else {
    tail = this.findSlash(path, start);
    if (tail === -1) 
      tail = path.length;
  }
  while (path.length > tail && this.isSlash(path, tail))
    tail++;
  return tail - start;
};

cls.trimSlash =
function(path) {
  return path !== '/' && this.isSlash(path, path.length-1) ?
    path.substring(0, path.length-1) : path;
};

cls.trimAll =
function(path) {
  var slash = this.findSlash(path, 0);
  return slash === -1 ? path :
    slash === 0 ? path.charAt(0) : path.substring(0,slash);
};

cls.hasTailSlash =
function(path) {
  return this.isSlash(path, path.length-1) ;
};

cls.hasHeadSlash =
function(path) {
  return this.isSlash(path, 0);
};

cls.joinRaw =
function(a, b, nd) {
  if (this.hasHeadSlash(b))
    return b;
  if (b === '.' && nd)
    return a;
  a = this.trimSlash(a);
  if (a != '/') a += '/';
  return a + b
};


