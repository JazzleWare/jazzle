this.rawAt =
function(path, at) {
  if (at >= path.length)
    return "";
  var tail = -1;
  if (path.charAt(at) === '/')
    tail = at + 1;
  else {
    tail = path.indexOf('/', at);
    if (tail === -1) tail = path.length;
  }
  while (tail < path.length && path.charAt(tail) === '/')
    tail++;
  return path.substring(at, tail);
};

this.tail =
function(path) {
  var start = path.lastIndexOf('/');
  if (start === -1) start = 0;
  return path.substring(0);
};

this.isRoot =
function(path) {
  return path.length && path.charAt(0) === '/';
};

this.joinRaw =
function(a,b,nd) { // join raw no dot
  if (this.isRoot(b))
    return b;
  if (nd && b === '.')
    return a;
  if (a.charAt(a.length-1) !== '/')
    a += '/';
  return a + b;
};

this.trimAll =
function(raw) {
  var e = raw.indexOf('/');
  return e === -1 ? raw : raw.substring(0, e);
};

this.trimLast =
function(raw) {
  return raw.charAt(raw.length-1) === '/' ? raw.substring(0, raw.length-1) : raw;
};
