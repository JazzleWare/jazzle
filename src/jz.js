var defaultJZ = '\
function er(str) { throw new Error(err) }\
function tz(str) { er("\'"+str+"\' is in its tz") }\
function cv(str) { er("\'"+str+"\' is immutable") }\
function r(v) { if (v) er("returned without calling super constructor") }\
function n(b,l) {\
  var str = "new b(", e = 0;\
  while (e < l.length) {\
    if (e) str += ",";\
    str += "l["+e+"]";\
    e++\
  }\
  return eval(str)\
}\
function c(c,l) { return c.apply(void 0, l) }\
function ex(a,b) { return Math.pow(a,b) }\
function obj() {\
  var r = arguments[0], e = 1;\
  while (e < arguments.length) {\
    r[arguments[e]] = r[arguments[e+1]];\
    e += 2\
  }\
  return r\
}\
function u(v) { return v === void 0 }\
function cm(t,m,l) { return m.apply(t, l) }\
function cr(o) { var mkr = (0,function() {}); mkr.prototype = o; return new mkr }\
var HAS = {}.hasOwnProperty;\
function has(o,n) { return HAS.call(o,n) }\
function cls() {\
  var b = arguments[0], p;\
  if (arguments.length === 2) {\
    var h = arguments[1];\
    b.prototype = p = cr(h.prototype);\
    for (var name in h)\
      if (has(h,name)) b[name] = h[name];\
  } else \
    p = b.prototype;\
  p.constructor = b;\
  return b;\
}\
function arrIter0(v) { this.v = v; this.i = 0 } var prot = arrIter0.prototype;\
prot.get = function() { return this.v[this.i++] };\
\
prot.end = function() { return this.v };\
function arrIter(v) { return new arrIter0(v); }\
\
function arr() {}\
function sp(){ }\
function h(cls) {}\
'
