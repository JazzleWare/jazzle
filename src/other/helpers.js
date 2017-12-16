 export var HELPERS = [
   { id: '#arr',
     codeString: 'o.arr = function() { var a = [], l = 0; while (l < arguments.length) a = a.concat(arguments[l++]); return a; };',
     uses: []
   },
   { id: '#tz',
     codeString: 'o.tz = function(n) { err(\'"\'+n+\'" is in the tdz -- it was used before its declaration was reached and evaluated\'); };',
     uses: ['#err']
   },
   { id: '#c',
     codeString: 'o.c = function(c,a) { return c.apply(void 0, a); };',
     uses: []
   },
   { id: '#sp' ,
     codeString: 'o.sp = function(v) { return [].concat(v); };',
     uses: []
   },
   { id: '#n',
     codeString: 'o.n = function(ctor, a) { var l = 0, str = "new ctor("; while (l < a.length) { if (l) str += ","; str += "a["+l+"]"; l++; } return eval(str); };',
     uses: []
   },
   { id: '#cm',
     codeString: 'o.cm = function(_this, c, a) { return c.apply(_this, a); };',
     uses: []
   },
   { id: '#err',
     codeString: 'function err(str) { throw new Error(str); }',
     uses: []
   },
   { id: '#obj',
     codeString: 'o.obj = function() { var obj = arguments[0], k = 1; while (k < arguments.length) { var v = k + 1; obj[arguments[k]] = arguments[v]; k += 2; } return obj; };',
     uses: []
   },
   { id: '#ex',
     codeString: 'o.ex = function(base, p) { return Math.pow(base, p);};',
     uses: []
   },
   { id: '#arrIter',
     codeString: 'o.arrIter = function(v) { return new arrIter0(v); };',
     uses: ['#arrIter0']
   },
   { id: '#arrIter0',
     codeString: 'function arrIter0(v) { this.v = v; this.i = 0; this.val = void 0; }\nvar ac = arrIter0.prototype;\nac.get = function() { return this.v[this.i++]; };\nac.end = function() { return this.v; };',
     uses: []
   },
   { id: '#u',
     codeString: 'o.u = function(n) { return n === void 0; }; ',
     uses: []
   },
   { id: '#of',
     codeString: 'o.of = function(v) { return new arrIter0(v); };\n'+
                 'arrIter0.prototype.next = function() { if (this.i < this.v.length) { this.val = this.get(); return true } this.end(); return false; };',
     uses: ['#arrIter0']
   },
   { id: '#o',
     codeString: 'o.o = function() { return arguments[0]; };',
     uses: []
   },
   { id: '#cv',
     codeString: 'o.cv = function(n) { err(\'reassigning constant name "\'+n+\'"\'); };',
     uses: ['#err']
   },
   { id: '#cls',
     codeString: 'o.cls = function() { var c = arguments[0], p = null; if (arguments.length === 2) c.prototype = cr(arguments[1].prototype); p = c.prototype; p.constructor = c; return p; };',
     uses: ['#cr']
   },
   { id: '#cr',
     codeString: 'function cr(o) { function l() {} l.prototype = o; return new l(); }' ,
     uses: []
   },
   { id: '#h',
     codeString: 'o.h = function(cls) { return cls; };',
     uses: []
   },
   { id: '#r',
     codeString: 'o.r = function() { arguments[arguments.length-1] || err("returning before calling super"); };',
     uses: ['#err']
   }
 ];
