var defaultJZ = '\
function er(str) { throw new Error(err) }\n\
function tz(str) { er("\'"+str+"\' is in its tz") }\n\
function cv(str) { er("\'"+str+"\' is immutable") }\n\
function r(v) { if (v) er("returned without calling super constructor") }\n\
function n(b,l) {\n\
  var str = "new b(", e = 0;\n\
  while (e < l.length) {\n\
    if (e) str += ",";\n\
    str += "l["+e+"]";\n\
    e++\n\
  }\n\
  return eval(str)\n\
}\n\
function c(c,l) { return c.apply(void 0, l) }\n\
function ex(a,b) { return Math.pow(a,b) }\n\
function obj() {\n\
  var r = arguments[0], e = 1;\n\
  while (e < arguments.length) {\n\
    r[arguments[e]] = r[arguments[e+1]];\n\
    e += 2\n\
  }\n\
  return r\n\
}\n\
function u(v) { return v === void 0 }\n\
function cm(t,m,l) { return m.apply(t, l) }\n\
function cr(o) { var mkr = (0,function() {}); mkr.prototype = o; return new mkr }\n\
var HAS = {}.hasOwnProperty;\n\
function has(o,n) { return HAS.call(o,n) }\n\
function cls() {\n\
  var b = arguments[0], p;\n\
  if (arguments.length === 2) {\n\
    var h = arguments[1];\n\
    b.prototype = p = cr(h.prototype);\n\
    for (var name in h)\n\
      if (has(h,name)) b[name] = h[name];\n\
  } else \n\
    p = b.prototype;\n\
  p.constructor = b;\n\
  return b;\n\
}\n\
\n\
var arrIter = function() {\n\
 function arrIter0(v) { this.v = v; this.i = 0; }\n\
 var e = arrIter0.prototype;\n\
 e.get = function() { return this.v[this.i++] };\n\
 e.end = function() { return this.v };\n\
 return function(v) { return new arrIter0(v); }\n\
}();\n\
\n\
function arr() {}\n\
function sp(){ }\n\
function h(cls) {}\n\
'
