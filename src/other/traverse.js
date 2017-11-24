
var D = '.'.charCodeAt(0);

var S = '/'.charCodeAt(0);

function cd(cur, to) {
  var coords = {s: 0, e: 0};

  while (getDirLeft(to, coords))
    cur = joinDirWithSingle(cur, to.substring(coords.s, coords.e));

  return cur;
};

function getDirLeft(to, coords) {
  var s = coords.e;
  if (s >= to.length)
    return null;

  var rootSlash = false, ch = to.charCodeAt(s);
  if (ch === S) {
    if (s > 0) s++;
    else rootSlash = true;
  }

  var e = to.indexOf('/', rootSlash ? s+1 : s);
  if (e === -1)
    e = to.length;

  coords.s = s;
  coords.e = e;

  return coords;
}

function joinDirWithSingle(cur, l) {
  if (l.length === 0 || l === '.')
    return cur;
  if (l.charCodeAt(0) === S)
    return l;
  if (l !== '..')
    return cur.length ? cur + (cur === '/' ? l : '/' + l) : l;

  ASSERT.call(this, cur.length, 'can not go above the start');

  var slash = cur.lastIndexOf('/');
//ASSERT.call(this, slash !== -1, 'can not go above [:'+cur+':]');
  
  if (slash === -1)
    return "";

  if (cur.length === 1) {
    ASSERT.call(this, cur.charCodeAt(0) === S, 'what?');
    ASSERT.call(this, false, 'can not go above base');
  }

  if (slash === 0)
    return '/';

  cur = cur.substring(0, slash);
  return cur;
}

function pathFor(str) {
  var e = str.lastIndexOf('/');
  return e === 0 ? '/' : e === -1 ? "" : str.substring(0, e);
}

function tailFor(str) {
  var e = str.lastIndexOf('/');
  return e === -1 ? str : e+1 >= str.length ? "" : str.substring(e+1);
}

 export {D, S, cd, getDirLeft, joinDirWithSingle, pathFor, tailFor};
