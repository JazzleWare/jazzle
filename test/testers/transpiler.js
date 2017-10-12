var util = require('../../common/util.js');
var ASSERT = util.ASSERT;
var HAS = util.HAS;
var lib = require('../lib.js');

function createTranspilerTester(Parser, Transformer, Emitter) {
  console.error('transpiler');
  var ts = new lib.TestSuite('Transpiler-Suite');
  ts.tester.make =
  function(test) {
    var objPath = test.get('objPath'),
        n = new Parser(test.get('src'), test.get('options')).parseProgram();
    var prog = n;
    if (objPath !== null) {
      var e = 0;
      while (e < objPath.length) {
        var name = objPath[e];
        ASSERT.call(this, HAS.call(n, name), '<'+name+'>');
        n = n[name];
        e++;
      }
    }
    return {
      n: n,
      e: new Emitter(),
      t: new Transformer(),
      prog: prog
    };
  };

  ts.tester.run =
  function(tester, test) {
    var n = tester.n, e = tester.e, t = tester.t;
    t.tr(tester.prog, false);
    e.emitAny(n, test.get('stmt') ? 2 : 0, test.get('stmt') || false);
    return e.flushCurrentLine(), e.out;
  };

  ts.comp.fail =
  function(e,a) {
    ASSERT.call(this, false, 'this suite has no fail case in it');
    return { value: "", compatible: e === a, state: 'complete' };
  };

  ts.comp.pass =
  function(e,a) {
    return { value: "", compatible: e === a, state: 'complete' };
  };

  ts.listener = createTranspilerListener();
  ts.listener.owner = ts;

  console.error('loading');
  loadTranspilerTests(ts);

  console.error('finished');

  return ts;
};

function createTranspilerListener() {
  return {
    notify: function(state, test) {
      if (state === 'complete' &&
        test.actual.type === 'pass' && test.asExpected()) {
        this.stats[test.actual.type].total++;
        console.error(state, test.actual.type, test.name);
      }
      else if (state !== 'finish') {
        console.error(test, this.owner);
        throw new Error('<'+state+'>');
      }
    },
    stats: { pass: { total: 0 } }, owner: null
  };
}

function loadTranspilerTests(ts) {
  var mt = buildTestBuilder(ts), o = ['body',0,'expression'], e = ['body', 0];

  mt('literal-string-single', "'a'", "'a';", e, true);
  mt('/* bef */\'a\'/* aft */;', '', "/* bef */'a'/* aft */;", e, true);

  mt('literal-string-multi',"\"a\"", "'a';", e, true);
  mt('/* bef */"a"/* aft */;// stmt','',"/* bef */'a'/* aft */;// stmt", e, true );

  mt('literal-num', "120", "120;", e, true);
  mt('/* bef */120/* aft */;// stmt', '', '/* bef */120/* aft */;// stmt', e, true);

  mt('literal-double', "5.5", "5.5;", e, true);
  mt('/* bef */5.5; // stmt','','/* bef */5.5;// stmt',e, true);

  mt('literal-0', "0", "0;", e, true);
  mt('mcmt-lnc-0-mcmt-lnc','/* bef-mul */ // bef-l\n0 // aft-l\n/* aft-mul */;','/* bef-mul */// bef-l\n0// aft-l\n/* aft-mul */;',e,true);

  mt('literal-float0', "0.5", "0.5;", e, true);
  mt('lcn-0.5-mcmt','// bef\n0.5/* aft */;','// bef\n0.5/* aft */;', e, true);

  mt('literal-sign-num', ".12", (.12)+";", e, true);
  mt('literal-sign-num-w-cmn', "/* bef */.12// aft\n;", "/* bef */"+(.12)+"// aft\n;", e, true);

  mt('binary-expression', "5 * 5", "5 * 5;", e, true);
  mt('binary-expression-cmn', "/* bl */ 5 /* al */*/* br */ 5 /* ae */;// stmt", "/* bl */5/* al */ * /* br */5/* ae */;// stmt", e, true);

  mt('binary-expression', "(5 * 5) * 5", "5 * 5 * 5;", e, true);
  mt(
    'binary-expression-cmn',
    "/* bpl */(/* b5l */5/* a5l */ * /* b5r */5/* ae */)/* apl */ * /* br */ 5 /* ae2 */;",
    "/* bpl *//* b5l */5/* a5l */ * /* b5r */5/* ae *//* apl */ * /* br */5/* ae2 */;",
    e, true);

  mt('binary-expression', "5 * (5 * 5)", "5 * (5 * 5);", e, true);
  mt('binary-expression-cmn', 
    "/* a */5/* b */ * /* e */(/* l */5/* u */ * /* n */5/* r */); /* L */", 
    "/* a */5/* b */ * /* e */(/* l */5/* u */ * /* n */5)/* r */;/* L */",
    e, true);

  mt('binary-expression', "5 * (5 - 5)", "5 * (5 - 5);", e, true);
  mt('binary-expression-cmn', 
    "/* a */5/* b */ * /* e */(/* l */5/* u */ - /* n */5/* r */)/* L */; /* E */", 
    "/* a */5/* b */ * /* e */(/* l */5/* u */ - /* n */5)/* r *//* L */;/* E */",
    e, true);

  mt('binary-expression', "5 * 5 - 5", "5 * 5 - 5;", e, true);
  mt('binary-expression-cmn', 
    "/* a */5/* b */ * /* e */5/* l */ - /* u */5/* n */; /* r */",
    "/* a */5/* b */ * /* e */5/* l */ - /* u */5/* n */;/* r */",
    e, true);

  mt('string-esc', "'\\\"'", "'\\\"';", e, true);
  mt('string-esc-cmn', "/* a */'\\\"'/* b */;", "/* a */'\\\"'/* b */;", e, true);

  mt('string-esc', "'\\b\\v\\f\\t\\r\\n\\\\\\\"\\\''", "'\\b\\v\\f\\t\\r\\n\\\\\\\"\\\'';", e, true);
  mt('string-esc-cmn', "/* a */'\\b\\v\\f\\t\\r\\n\\\\\\\"\\\''; /* b */", "/* a */'\\b\\v\\f\\t\\r\\n\\\\\\\"\\\'';/* b */", e, true);

  mt('new', "new 5()", "new 5();", e, true);
  mt('new-cmn', "/* a */new/* b */ 5/* e */(/* inner */)/* l */;/* n */", "/* a */new /* b */5/* e */(/* inner */)/* l */;/* n */", e, true);

  mt('new', "new (new 5)", "new new 5()();", e, true);
  mt('new-cmn',
    "/* a */new/* b */ (/* e */new/* l */ 5/* u */)/* n */;/* r */",
    "/* a */new /* b *//* e */new /* l */5()/* u */()/* n */;/* r */",
    e, true);

  mt('new', "new new 5", "new new 5()();", e, true);
  mt('new-cmn',
    "/* a */new/* b */new/* e */5/* l */;/* u */",
    "/* a */new /* b */new /* e */5()()/* l */;/* u */",
    e, true);

  mt('new', "new (-5)", "new (-5)();", e, true);
  mt('new-cmn',
    "/* a */new/* b */(/* e */-/* l */5/* u */)/* n */;/* r */",
    "/* a */new /* b *//* e */(-/* l */5)/* u */()/* n */;/* r */",
    e, true);

  mt('new', "new (new (-5))", "new new (-5)()();", e, true);
  mt('new-cmn',
    "/* a */new/* b */ (/* e */new/* l */ (/* u */-/* n */5/* r */)/* A */)/* w */; /* B */",
    "/* a */new /* b *//* e */new /* l *//* u */(-/* n */5)/* r */()/* A */()/* w */;/* B */", e, true);

  mt('new', "new (5 * 12)", "new (5 * 12)();", e, true);
  mt('new-cmn',
    "/* a */new/* b */ (/* e */5/* l */ * /* u */12/* n */)/* r */; /* A */",
    "/* a */new /* b */(/* e */5/* l */ * /* u */12)/* n */()/* r */;/* A */", e, true);

  mt('new', "(new 5) * 12", "new 5() * 12;", e, true);
  mt('new-cmn',
    "/* a */(/* b */new/* e */ 5/* l */)/* u */ * /* n */12/* r */; /* A */",
    "/* a *//* b */new /* e */5()/* l *//* u */ * /* n */12/* r */;/* A */", e, true);

  mt('new', "new 5(new 5, 5)", "new 5(new 5(), 5);", e, true);
  mt('new-cmn',
    "/* a */new /* b */5/* e */(/* l */new /* u */5/* n */, /* r */5/* A */,/* inner */)/* w */;/* B */",
    "/* a */new /* b */5/* e */(/* l */new /* u */5()/* n */, /* r */5/* A *//* inner */)/* w */;/* B */",
    e, true);

  mt('block', "{}", "{}", e, true );
  mt('block-cmn',
    "/* a */{/* inner */}/* b */",
    "/* a */{/* inner */}/* b */",
    e, true );

  mt('block', "{{}}", "{\n  {}\n}", e, true );
  mt('block-cmn',
    "/* a */{/* b */{/* e */}/* l */}/* u */",
    "/* a */{\n  /* b */{/* e */}/* l */\n}/* u */",
    e, true );

  mt('block', "{{}{}}", "{\n  {}\n  {}\n}", e, true );
  mt('block-cmn',
    "/* a */{/* b */{/* e */}/* l */{/* u */}/* n */}/* r */",
    "/* a */{\n  /* b */{/* e */}\n  /* l */{/* u */}/* n */\n}/* r */",
    e, true );

  mt('block', "{{{{}}{{}}}}", "{\n  {\n    {\n      {}\n    }\n    {\n      {}\n    }\n  }\n}", e, true );
  mt('block-cmn',
    "/* a */{// b\n{/* e */{// l\n{/* u */}// n\n}/* r */{// 12\n{// inner\n}/* w */}// L\n}/* A */}// stmt",
    "/* a */{\n  // b\n  {\n    /* e */{\n      // l\n      {/* u */}// n\n    }\n    /* r */{\n      // 12\n      {// inner\n      }/* w */\n    }// L\n  }/* A */\n}// stmt",
    e, true );

  mt('if', "if (5) {}", "if (5) {}", e, true );
  mt('if-cmn',
    "/* a */if/* b */ (/* e */5/* l */) /* u */{/* inner */}/* n */",
    "/* a */if/* b */ (/* e */5/* l */) /* u */{/* inner */}/* n */",
    e, true );

  mt('ifElse', "if (5) {} else {}", "if (5) {}\nelse {}", e, true );
  mt('ifElse-cmn',
    "/* a */if/* b */ (/* e */5/* l */) /* u */{/* inner */}/* e */else/* r */ {/* n */}/* L */",
    "/* a */if/* b */ (/* e */5/* l */) /* u */{/* inner */}/* e */\nelse /* r */{/* n */}/* L */",
    e, true );

  mt('ifElseIf', "if (5) {} else if (12) {}", "if (5) {}\nelse if (12) {}", e, true );
  mt('ifElseIf-cmn',
    "/* a */if/* b */ (/* e */5/* l */) /* u */{/* n */}/* r */ else/* A */ if/* B */ (/* E */12/* L */) /* U */{/* N */}/* R */",
    "/* a */if/* b */ (/* e */5/* l */) /* u */{/* n */}/* r */\nelse/* A */if/* B */ (/* E */12/* L */) /* U */{/* N */}/* R */",
    e, true );

  mt('ifElseIfElse', "if (5) {} else if (12) {} else {}", "if (5) {}\nelse if (12) {}\nelse {}", e, true );
  mt('ifElseIfElse-cmn',
    "/* a */if/* b */ (/* e */5/* l */)/* u */ {/* inner */}/* n */ else/* r */ if/* A */ (/* B */12/* E */)/* L */ {/* inner */}/* U */ else /* E */ {/* N */}// stmt",
    "/* a */if/* b */ (/* e */5/* l */) /* u */{/* inner */}/* n */\nelse/* r */if/* A */ (/* B */12/* E */) /* L */{/* inner */}/* U */\nelse /* E */{/* N */}// stmt",
    e, true );

  mt('stmtexpr', "5;", "5;", e, true );
  mt('stmtexpr-cmn',
    "/* a */5// b\n;// e",
    "/* a */5// b\n;// e",
    e, true );

  mt('stmtexpr', "{5}", "{\n  5;\n}", e, true );
  mt('stmtexpr-cmn',
    "// a\n{/* b */5// e\n;/* l */}// u",
    "// a\n{\n  /* b */5// e\n  ;/* l */\n}// u",
    e, true );

  mt('stmtexpr', "5", "5;", e, true );
  mt('stmtexpr-cmn',
    "/* a */5/* b */",
    "/* a */5;/* b */",
    e, true );

  mt('stmtexpr', "{{}5}", "{\n  {}\n  5;\n}", e, true );
  mt('stmtexpr-cmn',
    "/* a */{/* b */{/* e */}/* l */5/* u */}/* n */",
    "/* a */{\n  /* b */{/* e */}\n  /* l */5/* u */;\n}/* n */",
    e, true );

  mt('stmtexpr', "if (5) new 12; else 5", "if (5)\n  new 12();\nelse\n  5;", e, true );
  mt('stmtexpr-cmn',
    "/* a */if/* b */ (/* e */5/* l */)/* u */ new/* n */ 12/* r */;/* w */ else/* A */ 5/* B */",
    "/* a */if/* b */ (/* e */5/* l */)\n  /* u */new /* n */12()/* r */;/* w */\nelse\n  /* A */5;/* B */",
    e, true );

  mt('stmtexpr', "{if(5) new 12; else 5; if (5) 12; else new 5()}", "{\n  if (5)\n    new 12();\n  else\n    5;\n  if (5)\n    12;\n  else\n    new 5();\n}", e, true );
  mt('stmtexpr-cmn',
    "/* a */{/* b */if/* e */(/* l */5/* u */)/* n */ new/* r */ 12/* w */;// stmt\n else /* A */ 5 /* B */;/* E */ if/* L */ (/* U */5/* N */)/* R */ 12/* W */;// STMT\n else/* a */ new/* b */ 5/* e */(/* l */)/* u */}// n",
    "/* a */{\n  /* b */if/* e */ (/* l */5/* u */)\n    /* n */new /* r */12()/* w */;// stmt\n  else\n    /* A */5/* B */;\n  /* E */if/* L */ (/* U */5/* N */)\n    /* R */12/* W */;// STMT\n  else\n    /* a */new /* b */5/* e */(/* l */)/* u */;\n}// n",
    e, true );

  mt('call-5(5)', "5(5)", "5(5);", e, true);
  mt('call-5(5)-cmn',
    "/* a */5/* b */(/* e */5/* l */)/* u */",
    "/* a */5/* b */(/* e */5/* l */);/* u */",
    e, true);

  mt('call-5(5,5)', "5(5,5)", "5(5, 5);", e, true);
  mt('call-5(5,5)-cmn',
    "/* a */5/* b */(/* e */5/* l */,/* u */5/* n */)/* r */",
    "/* a */5/* b */(/* e */5/* l */, /* u */5/* n */);/* r */",
    e, true);

  mt('call-5[5](5)', "5[5](5)", "5[5](5);", e, true);
  mt('call-5[5](5)-cmn',
    "/* a */5/* b */[/* e */5/* l */]/* u */(/* n */5/* r */)/* w */",
    "/* a */5/* b */[/* e */5/* l */]/* u */(/* n */5/* r */);/* w */",
    e, true);

  mt('call-5(...5)', "5(...5)", "jz.c(5, jz.arr(jz.sp(5)));", e, true);
  mt('call-5(...5)-cmn',
    "/* a */5/* b */(/* e */.../* l */5/* u */)/* n */",
    "jz.c(/* a */5/* b */, jz.arr(/* e */jz.sp(/* l */5)/* u */));/* n */",
    e, true);

  mt('call-5(5,...5)', "5(5,...5)", "jz.c(5, jz.arr([5], jz.sp(5)));", e, true);
  mt('call-5(5,...5)-cmn',
    "/* a */5/* b */(/* e */5/* l */,/* u */.../* n */5/* r */)/* w */",
    "jz.c(/* a */5/* b */, jz.arr([/* e */5/* l */], /* u */jz.sp(/* n */5)/* r */));/* w */",
    e, true);

  mt('call-5[5](...5)', "5[5](...5)", "jz.cm(t = 5, t[5], jz.arr(jz.sp(5)));", e, true);
  mt('call-5[5](...5)-cmn',
    "/* a */5/* b */[/* e */5/* l */]/* u */(/* n */.../* r */5/* N */)/* w */",
    "jz.cm(t = /* a */5/* b */, t[/* e */5/* l */]/* u */, jz.arr(/* n */jz.sp(/* r */5)/* N */));/* w */",
    e, true);

  mt('new-5(5)', "new 5(5)", "new 5(5);", e, true);
  mt('new-5(5)-cmn',
    "/* a */new/* b */ 5/* e */(/* l */5/* u */)/* n */",
    "/* a */new /* b */5/* e */(/* l */5/* u */);/* n */",
    e, true);

  mt('new-5(...5)', "new 5(...5)","jz.n(5, jz.arr(jz.sp(5)));", e, true);
  mt('new-5(...5)-cmn', 
    "/* a */new/* b */ 5/* e */(/* l */.../* u */5/* n */)/* r */",
    "/* a */jz.n(/* b */5/* e */, jz.arr(/* l */jz.sp(/* u */5)/* n */));/* r */", e, true);

  mt('[a]', '[a]', '[a];', e, true);
  mt('[a]-cmn',
    '/* a */[/* b */a/* e */]/* l */',
    '/* a */[/* b */a/* e */];/* l */',
    e, true);

  mt('[a,b]', '[a,b]', '[a, b];', e, true);
  mt('[a,b]-cmn',
    '/* a */[/* b */a/* e */,/* l */b/* u */]/* n */',
    '/* a */[/* b */a/* e */, /* l */b/* u */];/* n */',
    e, true);

  mt('[a,b,e]', '[a,b,e]', '[a, b, e];', e, true);
  mt('[a,b,e]-cmn',
    '/* a */[/* b */a/* e */,/* l */b/* u */,/* n */e/* r */]/* w */',
    '/* a */[/* b */a/* e */, /* l */b/* u */, /* n */e/* r */];/* w */',
    e, true);

  mt('[a,]', '[a,]', '[a];', e, true);
  mt('[a,]-cmn',
    '/* a */[/* b */a/* e */,/* l */]/* u */',
    '/* a */[/* b */a/* e *//* l */];/* u */',
    e, true);

  mt('[,a]', '[,a]', '[void 0, a];', e, true);
  mt('[,a]-cmn',
    '/* a */[/* b */,/* e */a/* l */]/* u */',
    '/* a */[/* b */void 0, /* e */a/* l */];/* u */',
    e, true);

  mt('[,5,]', '[,5,]', '[void 0, 5];', e, true);
  mt('[,5,]-cmn',
    '/* a */[/* b */,/* e */5/* l */,/* u */]/* n */',
    '/* a */[/* b */void 0, /* e */5/* l *//* u */];/* n */',
    e, true);

  mt('[,]', '[,]', '[void 0];', e, true);
  mt('[,]-cmn',
    '/* a */[/* b */,/* e */]/* l */',
    '/* a */[/* b */void 0/* e */];/* l */',
    e, true);

  mt('[...5]', '[...5]', 'jz.arr(jz.sp(5));', e, true);
  mt('[...5]-cmn',
    '/* a */[/* b */.../* e */5/* l */]/* u */',
    '/* a */jz.arr(/* b */jz.sp(/* e */5)/* l */);/* u */',
    e, true);

  mt('[...5,]', '[...5,]', 'jz.arr(jz.sp(5));', e, true);
  mt('[...5,]-cmn',
    '/* a */[/* b */.../* e */5/* l */,/* u */]/* n */',
    '/* a */jz.arr(/* b */jz.sp(/* e */5)/* l *//* u */);/* n */',
    e, true);

  mt('[...5,,]', '[...5,,]', 'jz.arr(jz.sp(5), [void 0]);', e, true);
  mt('[...5,,]-cmn',
    '/* a */[/* b */.../* e */5/* l */,/* u */,/* n */]/* r */',
    '/* a */jz.arr(/* b */jz.sp(/* e */5)/* l */, [/* u */void 0/* n */]);/* r */',
    e, true);

  mt('[,...5]', '[,...5]','jz.arr([void 0], jz.sp(5));', e, true);
  mt('[,...5]-cmn',
    '/* a */[/* b */,/* e */.../* l */5/* u */]/* n */',
    '/* a */jz.arr([/* b */void 0], /* e */jz.sp(/* l */5)/* u */);/* n */',
    e, true);

  mt('[,...5,]', '[,...5,]','jz.arr([void 0], jz.sp(5));', e, true);
  mt('[,...5,]-cmn',
    '/* a */[/* b */,/* e */.../* l */5/* u */,/* n */]/* r */',
    '/* a */jz.arr([/* b */void 0], /* e */jz.sp(/* l */5)/* u *//* n */);/* r */',
    e, true);

  mt('[...5, ...12]', '[...5, ...12]','jz.arr(jz.sp(5), jz.sp(12));', e, true);
  mt('[...5, ...12]-cmn',
    '/* a */[// b\n.../* e */5// l\n,/* u */ ...// n\n12/* r */]// w',
    '/* a */jz.arr(// b\njz.sp(/* e */5)// l\n, /* u */jz.sp(// n\n12)/* r */);// w',
    e, true);

  mt('[5,...12,12,...5]', '[5,...12,12,...5]','jz.arr([5], jz.sp(12), [12], jz.sp(5));', e, true);
  mt('[5,...12,12,...5]-cmn',
    '/* a */[/* b */5/* e */,/* l */.../* u */12/* n */,/* r */12/* w */,/* A */.../* B */5/* E */]/* L */',
    '/* a */jz.arr([/* b */5/* e */], /* l */jz.sp(/* u */12)/* n */, [/* r */12/* w */], /* A */jz.sp(/* B */5)/* E */);/* L */',
    e, true);

  mt('[5,...12,12,...5,40]', '[5,...12,12,...5,40]','jz.arr([5], jz.sp(12), [12], jz.sp(5), [40]);', e, true);
  mt('[5,...12,12,...5,40]-cmn',
    '/* a */[/* b */5/* e */,/* l */.../* u */12/* n */,/* r */12/* w */,/* A */.../* B */5/* E */,/* L */40/* U */]/* N */',
    '/* a */jz.arr([/* b */5/* e */], /* l */jz.sp(/* u */12)/* n */, [/* r */12/* w */], /* A */jz.sp(/* B */5)/* E */, [/* L */40/* U */]);/* N */',
    e, true);

  mt('5(5,)', '5(5,)', '5(5);', e, true);
  mt('5(5,)-cmn',
    '/* a */5/* b */(/* e */5/* l */,/* u */)/* n */',
    '/* a */5/* b */(/* e */5/* l *//* u */);/* n */',
    e, true);

  mt('({a:b})', '({a:b})', '({a: b});', e, true);
  mt('({a:b})-cmn',
    '/* a */(/* b */{/* e */a/* l */:/* u */b/* n */}/* r */)/* w */',
    '/* a *//* b */({/* e */a/* l */: /* u */b/* n */})/* r */;/* w */',
    e, true);

  mt('({a:b,e})', '({a:b,e})', '({a: b, e: e});', e, true);
  mt('({a:b,e})-cmn',
    '/* a */(/* b */{/* e */a/* l */:/* u */b/* n */,/* r */e/* w */}/* A */)/* B */',
    '/* a *//* b */({/* e */a/* l */: /* u */b/* n */, /* r */e: e/* w */})/* A */;/* B */',
    e, true);

  mt('{{a,b:e})', '({a,b:e})', '({a: a, b: e});', e, true);
  mt('{{a,b:e})-cmn',
    '/* a */(/* b */{/* e */a/* l */,/* u */b/* n */:/* r */e/* w */}/* A */)/* B */',
    '/* a *//* b */({/* e */a: a/* l */, /* u */b/* n */: /* r */e/* w */})/* A */;/* B */',
    e, true);

  mt('({a,b})', '({a,b})', '({a: a, b: b});', e, true);
  mt('({a,b})-cmn',
    '/* a */(/* b */{/* e */a/* l */,/* u */b/* n */}/* r */)/* w */',
    '/* a *//* b */({/* e */a: a/* l */, /* u */b: b/* n */})/* r */;/* w */',
    e, true);

  mt('({a,b,})', '({a,b,})', '({a: a, b: b});', e, true);
  mt('({a,b,})-cmn',
    '/* a */(/* b */{/* e */a/* l */,/* u */b/* n */,/* r */}/* w */)/* A */',
    '/* a *//* b */({/* e */a: a/* l */, /* u */b: b/* n *//* r */})/* w */;/* A */',
    e, true);

  mt('({})', '({})', '({});', e, true);
  mt('({})-cmn',
    '/* a */(/* b */{/* e */}/* l */)/* u */',
    '/* a *//* b */({/* e */})/* l */;/* u */',
    e, true);

  mt('({[5]:12})', '({[5]:12})', 'jz.obj({}, 5, 12);', e, true);
  mt('({[5]:12})-cmn',
    '/* a */(/* b */{/* e */[/* l */5/* u */]/* n */:/* r */12/* w */}/* A */)/* B */',
    '/* a *//* b */jz.obj({}, /* e *//* l */5/* u *//* n */, /* r */12/* w */)/* A */;/* B */',
    e, true);

  mt('({5:40,[12*5]:12})', '','jz.obj({5: 40}, 12 * 5, 12);', e, true);
  mt('({5:40,[12*5]:12})',
    '/* a */(/* b */{/* e */5/* l */:/* u */40/* n */,/* A */[/* B */12/* E */*/* L */5/* U */]/* N */:/* R */12/* W */}/* n */)/* r */',
    '/* a *//* b */jz.obj({/* e */5/* l */: /* u */40/* n */}, /* A *//* B */12/* E */ * /* L */5/* U *//* N */, /* R */12/* W */)/* n */;/* r */',
    e, true);

  mt('({[5]: 12, 12: 5})', '','jz.obj({}, 5, 12, 12, 5);', e, true); 
  mt('({[5]: 12, 12: 5})',
    '/* a */(/* b */{/* e */[/* l */5/* u */]/* n */: /* r */12/* w */, /* A */12/* B */:/* E */5/* L */}/* U */)/* N */',
    '/* a *//* b */jz.obj({}, /* e *//* l */5/* u *//* n */, /* r */12/* w */, /* A */12/* B */, /* E */5/* L */)/* U */;/* N */',
    e, true); 

  mt('({[a]: b, l: [w]})', '' ,'jz.obj({}, a, b, \'l\', [w]);', e, true);
  mt('({[a]: b, l: [w]})',
    '/* a */(/* b */{/* e */[/* l */a/* u */]/* n */: /* r */b/* w */, /* A */l/* B */: /* E */[/* L */w/* U */]/* N */}/* R */)/* W */' ,
    '/* a *//* b */jz.obj({}, /* e *//* l */a/* u *//* n */, /* r */b/* w */, /* A */\'l\'/* B */, /* E */[/* L */w/* U */]/* N */)/* R */;/* W */',
    e, true);

  mt('while (false) {}', '', 'while (false) {}', e, true);
  mt('while (false) {}',
    '/* a */while/* b */ (/* e */false/* l */) /* u */{/* n */}/* L */',
    '/* a */while/* b */(/* e */false/* l */) /* u */{/* n */}/* L */',
    e, true);

  mt('while (false) {5}', '', 'while (false) {\n  5;\n}', e, true);
  mt('while (false) {5}',
    '/* a */while/* b */ (/* e */false/* l */) /* u */{/* n */5/* r */}/* w */',
    '/* a */while/* b */(/* e */false/* l */) /* u */{\n  /* n */5/* r */;\n}/* w */',
    e, true);

  mt('while (false) 5;', '', 'while (false)\n  5;', e, true);
  mt('while (false) 5;',
    '/* a */while/* b */ (/* e */false/* l */) // u\n5/* n */;// r',
    '/* a */while/* b */(/* e */false/* l */)\n  // u\n  5/* n */;// r',
    e, true);

  mt('while (false);', '', 'while (false);', e, true);
  mt('while (false);',
    '/* a */while/* b */ (/* e */false/* l */)/* u */;/* n */',
    '/* a */while/* b */(/* e */false/* l */)/* u */;/* n */',
    e, true);

  mt('while (false) 5; 5;', '', 'while (false)\n  5;\n5;', null, true);
  mt('while (false) 5; 5;',
    '/* a */while/* b */ (/* e */false/* l */)/* u */ 5/* n */;/* r */ 5/* w */;/* L */',
    '/* a */while/* b */(/* e */false/* l */)\n  /* u */5/* n */;\n/* r */5/* w */;/* L */',
    null, true);

  mt('(5).e()', '', '5 .e();', e, true);
  mt('(5).e()',
    '/* a */(/* b */5/* e */)/* l */./* u */e/* n */(/* inner */)/* r */',
    '/* a *//* b */5/* e *//* l */./* u */e/* n */(/* inner */);/* r */',
    e, true);

  mt('5.5.e()', '', '5.5.e();', e, true);
  mt('5.5.e()',
    '/* a */5.5/* b */./* e */e/* l */(/* u */)/* n */',
    '/* a */5.5/* b */./* e */e/* l */(/* u */);/* n */',
    e, true);

  mt('- -5', '', '- -5;', e, true);
  mt('- -5',
    '/* a */-/* b */-/* e */5/* l */',
    '/* a */-/* b */-/* e */5;/* l */',
    e, true);

  mt('- --5[5]', '', '- --5[5];', e, true);
  mt('- --5[5]',
    '/* a */-/* b */ --/* e */5/* l */[/* u */5/* n */]/* r */',
    '/* a */-/* b */--/* e */5/* l */[/* u */5/* n */];/* r */',
    e, true);

  mt('-5[5]--', '', '-5[5]--;', e, true);
  mt('-5[5]--',
    '/* a */-/* b */5/* e */[/* l */5/* u */]/* n */--/* r */',
    '/* a */-/* b */5/* e */[/* l */5/* u */]/* n */--;/* r */',
    e, true);

  mt('-+5', '','-+5;',e, true);
  mt('-+5',
    '/* a */-/* b */+/* e */5/* l */',
    '/* a */-/* b */+/* e */5;/* l */',
    e, true);

  mt('switch (5) {}', '', 'switch (5) {}', e, true);
  mt('switch (5) {}',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */ {/* n */}/* r */',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */{/* n */}/* r */',
    e, true);

  mt('switch (5) { case 12: }', '', 'switch (5) {\ncase 12:\n}', e, true);
  mt('switch (5) { case 12: }',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */ { /* n */case/* r */ 12/* w */:/* inner */ }/* L */',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */{\n/* n */case/* r */12/* w */:/* inner */\n}/* L */',
    e, true);

  // must not actually suck trailing comments (TODO-)
  mt('switch (5) { case 40: case 12: 5() }', '', 'switch (5) {\ncase 40:\ncase 12:\n  5();\n}', e, true);
  mt('switch (5) { case 40: case 12: 5() }',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */ {/* n */ case/* r */ 40/* w */: /* A */case/* B */ 12/* E */: /* L */5/* U */(/* N */)/* R */ }/* W */',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */{\n/* n */case/* r */40/* w */:/* A */\ncase/* B */12/* E */:\n  /* L */5/* U */(/* N */)/* R */;\n}/* W */',
    e, true);

  mt('switch (5) { case 40: 12(); case 12: }', '', 'switch (5) {\ncase 40:\n  12();\ncase 12:\n}', e, true);
  mt('switch (5) { case 40: 12(); case 12: }',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */ { /* n */ case /* r */ 40 /* w */: /* A */ 12 /* B */(/* E */)/* L */;/* U */ case /* N */ 12/* R */: /* inner */ }// STMT',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */{\n/* n */case/* r */40/* w */:\n  /* A */12/* B */(/* E */)/* L */;/* U */\ncase/* N */12/* R */:/* inner */\n}// STMT',
    e, true);

  mt('switch (5) { default: 12() }', '', 'switch (5) {\ndefault:\n  12();\n}', e, true);
  mt('switch (5) { default: 12() }',
    '/* a */switch/* b */ (/* e */5/* l */) /* u */{/* n */ default/* r */: /* A */12/* B */(/* E */)/* L */ }/* U */',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */{\n/* n */default/* r */:\n  /* A */12/* B */(/* E */)/* L */;\n}/* U */',
    e, true);

  mt('switch (5) { case 12: switch (12) { case 5: }}', '', 'switch (5) {\ncase 12:\n  switch (12) {\n  case 5:\n  }\n}', e, true);
  mt('switch (5) { case 12: switch (12) { case 5: }}',
    '/* a */switch/* b */ (/* e */5/* l */) /* u */{/* n */ case/* r */ 12/* w */: /* A */switch/* B */ (/* E */12/* L */) /* U */{/* N */ case/* R */ 5/* W */: /* A */ }/* 12 */}/* B */',
    '/* a */switch/* b */ (/* e */5/* l */)/* u */{\n/* n */case/* r */12/* w */:\n  /* A */switch/* B */ (/* E */12/* L */)/* U */{\n  /* N */case/* R */5/* W */:/* A */\n  }/* 12 */\n}/* B */',
    e, true);

  mt('5 ? 40 : 12', '', '5 ? 40 : 12;', e, true);
  mt('5 ? 40 : 12',
    '/* a */5// b\n ? // e\n 40 /* l */ : /* u */ 12 // n',
    '/* a */5// b\n ? // e\n40/* l */ : /* u */12;// n',
    e, true);

  // because leading is attached to the smallest node while trailing is attached to the biggest; reverse should actually hold
  // there must be a flag named EC_FPAREN (force parentheses); that way, the `emitCondTest` routing need not parenthesize anything -- and /* r *//* w */ will get out then
  mt('(5 ? 40 : 12) ? 5 : 5 ? 40 : 12', '', '(5 ? 40 : 12) ? 5 : 5 ? 40 : 12;', e, true);
  mt('(5 ? 40 : 12) ? 5 : 5 ? 40 : 12',
    '/* a */(/* b */5/* e */ ? // l\n 40 /* u */ : /* n */ 12 /* r */)/* w */ ? /* A */ 5 /* B */ : /* E */ 5 /* L */ ? // U\n 40 /* N */ : /* R */ 12 /* W */',
    '(/* a *//* b */5/* e */ ? // l\n40/* u */ : /* n */12/* r *//* w */) ? /* A */5/* B */ : /* E */5/* L */ ? // U\n40/* N */ : /* R */12;/* W */',
    e, true);

  mt('a=5','','a = 5;', e, true);
  mt('a=5',
   '/* a */a/* b */=/* e */5/* l */',
   '/* a */a/* b */ = /* e */5;/* l */',
    e, true);

  mt('a[b]=5','','a[b] = 5;', e, true);
  mt('a[b]=5',
   '/* a */a/* b */[/* e */b/* l */]/* u */=/* n */5/* r */',
   '/* a */a/* b */[/* e */b/* l */]/* u */ = /* n */5;/* r */',
    e, true);

  mt('a*=12','','a *= 12;',e, true);
  mt('a*=12',
   '/* a */a/* b */*=/* e */12/* l */',
   '/* a */a/* b */ *= /* e */12;/* l */',
   e, true);

  mt('a[b]*=12','','a[b] *= 12;',e, true);
  mt('a[b]*=12',
   '/* a */a/* b */[/* e */b/* l */]/* u */*=/* n */12/* r */',
   '/* a */a/* b */[/* e */b/* l */]/* u */ *= /* n */12;/* r */',
   e, true);

  mt('a |= 40','','a |= 40;',e, true);
  mt('a |= 40',
   '/* a */a// b\n |= // e\n  40/* l */',
   '/* a */a// b\n |= // e\n40;/* l */',
   e, true);

  mt('a[b] |= 40','','a[b] |= 40;',e, true);
  mt('a[b] |= 40',
   '/* a */a/* b */[/* e */b/* l */]/* u */ |= // n\n40// r\n',
   '/* a */a/* b */[/* e */b/* l */]/* u */ |= // n\n40;// r',
   e, true);

  mt('++a','','++a;',e, true);
  mt('++a',
   '// a\n++// b\na// e',
   '// a\n++// b\na;// e',
   e, true);

  mt('++a[b]','','++a[b];',e, true);
  mt('++a[b]',
   '// a\n++// b\na// e\n[// l\nb// u\n]// r',
   '// a\n++// b\na// e\n[// l\nb// u\n];// r',
   e, true);

  mt('a ** 1.5','','jz.ex(a, 1.5);',e, true);
  mt('a ** 1.5',
   '/* a */a/* b */ ** /* e */1.5/* l */',
   'jz.ex(/* a */a/* b */, /* e */1.5);/* l */',
   e, true);

  mt('a[b] ** 1.5','','jz.ex(a[b], 1.5);',e, true);
  mt('a[b] ** 1.5',
   '/* a */a/* b */[/* e */b/* l */]/* u */ ** /* n */1.5/* r */',
   'jz.ex(/* a */a/* b */[/* e */b/* l */]/* u */, /* n */1.5);/* r */',
   e, true);

  mt('a **= 1.5','','a = jz.ex(a, 1.5);',e, true);
  mt('a **= 1.5',
   '/* a */a/* b */ **= /* e */1.5/* l */',
   '/* a */a/* b */ = jz.ex(a, /* e */1.5);/* l */',
   e, true);

  mt('a[b] **= 1.5','','(t = a)[t1 = b] = jz.ex(t[t1], 1.5);',e, true);
  mt('a[b] **= 1.5',
   '/* a */a/* b */[/* e */b/* l */]/* u */ **= /* n */1.5/* L */',
   '(t = /* a */a/* b */)[t1 = /* e */b/* l */]/* u */ = jz.ex(t[t1], /* n */1.5);/* L */',
   e, true);

  mt('[] = 5','','t = jz.arrIter(5);\nt.end();',e, true);
  mt('[] = 5',
   '/* a */[/* b */]/* e */ = /* l */5/* u */',
   '/* a */t = jz.arrIter(/* l */5);\nt.end();/* b *//* e *//* u */',
   e, true);

  mt('[,] = 5','','t = jz.arrIter(5);\nt.get();\nt.end();',e, true);
  mt('[,] = 5',
   '/* a */[/* b */,/* e */]/* l */ = /* u */5/* n */',
   '/* a */t = jz.arrIter(/* u */5);\n/* b */t.get();\nt.end();/* e *//* l *//* n */',
   e, true);

  mt('[] = [] = 5','','t = jz.arrIter((t = jz.arrIter(5), t.end()));\nt.end();',e, true);
  mt('[] = [] = 5',
   '/* a */[/* b */]/* e */ = /* l */[/* u */]/* n */ = /* N */5/* L */',
   '/* a */t = jz.arrIter((/* l */t = jz.arrIter(/* N */5), t.end()/* u *//* n */));\nt.end();/* b *//* e *//* L */',
   e, true);

  mt('[,] = [] = 5','','t = jz.arrIter((t = jz.arrIter(5), t.end()));\nt.get();\nt.end();',e, true);
  mt('[,] = [] = 5',
   '/* a */[/* b */,/* n */]/* l */ = /* e */[/* N */]/* E */ = /* 12 */5// 12L',
   '/* a */t = jz.arrIter((/* e */t = jz.arrIter(/* 12 */5), t.end()/* N *//* E */));\n/* b */t.get();\nt.end();/* n *//* l */// 12L',
   e, true);

  mt('[[]] = 5','','t = jz.arrIter(5);\nt1 = jz.arrIter(t.get());\nt1.end();\nt.end();',e, true);
  mt('[[]] = 5',
   '// a\n[// b\n[// n\n]// e\n]// u\n = // l\n5// N\n',
   '// a\nt = jz.arrIter(// l\n5);\n// b\nt1 = jz.arrIter(t.get());\nt1.end();// n\n// e\nt.end();// u\n// N',
   e, true);

  mt('[l] = 5','','t = jz.arrIter(5);\nl = t.get();\nt.end();',e, true);
  mt('[l] = 5',
   '/* a */[/* b */l/* l */]/* e */ = /* u */5/* n */',
   '/* a */t = jz.arrIter(/* u */5);\n/* b */l/* l */ = t.get();\nt.end();/* e *//* n */',
   e, true);

  mt('[l,] = 5','','t = jz.arrIter(5);\nl = t.get();\nt.end();',e, true);
  mt('[l,] = 5',
   '/* a */[/* b */l/* l */,/* e */]/* u */ = /* n */5/* r */',
   '/* a */t = jz.arrIter(/* n */5);\n/* b */l/* l */ = t.get();\nt.end();/* e *//* u *//* r */',
   e, true);

  mt('a, b, e, l','','a, b, e, l;',e, true);
  mt('a, b, e, l',
   '/* a */a/* b */,/* e */ b/* l */,/* u */ e/* n */,/* r */ l/* w */',
   '/* a */a/* b */, /* e */b/* l */, /* u */e/* n */, /* r */l;/* w */',
   e, true);

  mt('(a,b),(e,l)','','(a, b), (e, l);',e, true);
  mt('(a,b),(e,l)',
   '/* a */(/* b */a/* e */,/* l */b/* u */)/* n */,/* A */(/* B */e/* E */,/* L */l/* U */)/* N */',
   '/* a */(/* b */a/* e */, /* l */b)/* u *//* n */, /* A */(/* B */e/* E */, /* L */l)/* U */;/* N */',
   e, true);

  mt('a * b, e = l','','a * b, e = l;',e, true);
  mt('a * b, e = l',
   '/* a */a/* b */ * /* e */b/* l */, /* u */e/* n */ = /* r */l/* w */',
   '/* a */a/* b */ * /* e */b/* l */, /* u */e/* n */ = /* r */l;/* w */',
   e, true);

  mt('(a = (b, e), l), 5','','(a = (b, e), l), 5;',e, true);
  mt('(a = (b, e), l), 5',
   '/* a */(/* b */a/* l */ =/* e */ (/* u */b/* n */, /* r */e/* w */)/* A */, /* B */l/* L */)/* E */, /* U */5/* N */',
   '/* a */(/* b */a/* l */ = /* e */(/* u */b/* n */, /* r */e)/* w *//* A */, /* B */l)/* L *//* E */, /* U */5;/* N */',
   e, true);

  mt('5 ? (a,b) : (e,l)','','5 ? (a, b) : (e, l);',e, true);
  mt('5 ? (a,b) : (e,l)',
   '/* a */5/* b */ ? /* e */(/* l */a/* u */,/* n */b/* r */)/* w */ : /* A */(/* B */e/* E */,/* L */l/* U */)/* N */',
   '/* a */5/* b */ ? /* e */(/* l */a/* u */, /* n */b)/* r *//* w */ : /* A */(/* B */e/* E */, /* L */l)/* U */;/* N */',
   e, true);

  mt('5((a,b))','','5((a, b));',e, true);
  mt('5((a,b))',
   '/* a */5/* b */(/* l */(/* e */a/* u */,/* n */b/* r */)/* w */)/* E */',
   '/* a */5/* b */(/* l */(/* e */a/* u */, /* n */b)/* r *//* w */);/* E */',
   e, true);

  mt('do while(false); while(false);','','do {\n  while (false);\n} while (false);',e, true);
  mt('do while(false); while(false);',
   '/* a */do/* b */ while/* e */(/* l */false/* u */)/* n */;/* r */ while/* w */(/* A */false/* B */)/* E */;/* L */',
   '/* a */do {\n  /* b */while/* e */(/* l */false/* u */)/* n */;/* r */\n} while/* w */(/* A */false/* B */)/* E */;/* L */',
   e, true);

  // TODO: would be better to have things like `{// a\n}` become `{\n  // a\n}`
  mt('do {} while (false);','','do {} while (false);',e, true);
  mt('do {} while (false);',
   '// a\ndo// b\n {// l\n}// e\n while// u\n (// n\nfalse// r\n)// w\n;// E\n',
   '// a\ndo // b\n{// l\n}// e\n while// u\n(// n\nfalse// r\n)// w\n;// E',
   e, true);

  mt(';','',';',e, true);
  mt(';',
   '/* a */;/* b */',
   '/* a */;/* b */',
   e, true);

  mt('a.b','','a.b;',null,true); // TODO: handle v < 5, where kws can not come as an uncomputed memname
  mt('a.b',
   '/* a */a/* b */./* l */b/* e */',
   '/* a */a/* b */./* l */b;/* e */',
   null,true); // TODO: handle v < 5, where kws can not come as an uncomputed memname

  mt('a[b]','','a[b];',e, true);
  mt('a[b]',
   '/* a */a/* b */[/* l */b/* e */]/* u */',
   '/* a */a/* b */[/* l */b/* e */];/* u */',
   e, true);

  mt('(a.b)()','','a.b();',e, true);
  mt('(a.b)()',
   '/* a */(/* b */a/* l */./* e */b/* u */)/* n */(/* r */)/* w */',
   '/* a *//* b */a/* l */./* e */b/* u *//* n */(/* r */);/* w */',
   e, true);

  mt('(a[b])()','','a[b]();',e, true);
  mt('(a[b])()',
   '/* a */(/* b */a/* e */[/* l */b/* u */]/* n */)/* r */(/* w */)/* L */',
   '/* a *//* b */a/* e */[/* l */b/* u */]/* n *//* r */(/* w */);/* L */',
   e, true);

  mt('a.b = 5','','a.b = 5;',e, true);
  mt('a.b = 5',
   '/* a */a/* b */./* l */b/* e */ = /* u */5/* n */',
   '/* a */a/* b */./* l */b/* e */ = /* u */5;/* n */',
   e, true);

  mt('a.b **= 5','','(t = a).b = jz.ex(t.b, 5);',e, true);
  mt('a.b **= 5',
   '/* a */a/* b */./* l */b/* e */ **= /* u */5/* n */',
   '(t = /* a */a/* b */)./* l */b/* e */ = jz.ex(t.b, /* u */5);/* n */',
   e, true);

  mt('[a.b] = 5','','t = jz.arrIter(5);\na.b = t.get();\nt.end();',e, true);
  mt('[a.b] = 5',
   '/* a */[/* b */a/* l */./* e */b/* u */]/* n */ = /* r */5/* w */',
   '/* a */t = jz.arrIter(/* r */5);\n/* b */a/* l */./* e */b/* u */ = t.get();\nt.end();/* n *//* w */',
   e, true);

  mt('[a=5]=12','','t = jz.arrIter(12);\na = jz.u(t1 = t.get()) ? 5 : t1;\nt.end();',e, true);
  mt('[a=5]=12',
   '/* a */[/* b */a/* l */=/* e */5/* u */]/* n */=/* r */12/* w */',
   '/* a */t = jz.arrIter(/* r */12);\n/* b */a/* l */ = jz.u(t1 = t.get()) ? /* e */5 : t1/* u */;\nt.end();/* n *//* w */',
   e, true);

  mt('[a=[b]=5]=12','','t = jz.arrIter(12);\na = jz.u(t1 = t.get()) ? (t1 = jz.arrIter(5), b = t1.get(), t1.end()) : t1;\nt.end();',e, true);
  mt('[a=[b]=5]=12',
   '/* a */[/* b */a/* l */=/* e */[/* u */b/* n */]/* r */=/* w */5/* A */]/* B */=/* L */12/* E */',
   '/* a */t = jz.arrIter(/* L */12);\n/* b */a/* l */ = jz.u(t1 = t.get()) ? (/* e */t1 = jz.arrIter(/* w */5), /* u */b/* n */ = t1.get(), t1.end()/* r */) : t1/* A */;\nt.end();/* B *//* E */',
   e, true);

  mt('[a,...b] = 12','','t = jz.arrIter(12);\na = t.get();\nb = t.rest();\nt.end();',e, true);
  mt('[a,...b] = 12',
    '/* a */[/* b */a/* l */,/* e */.../* u */b/* n */]/* r */ = /* w */12/* A */',
    '/* a */t = jz.arrIter(/* w */12);\n/* b */a/* l */ = t.get();\n/* e *//* u */b = t.rest()/* n */;\nt.end();/* r *//* A */',
    e, true);

  mt('{let a;} var a;-cmn',
   '',
   '{\n  var a1 = void 0;\n}',
   e,true);
}

function buildTestBuilder(ts) {
  return function makeTest(name, src, e, objPath, isStmt) {
    if (src === "") src = name;
    false && console.error('TEST', name);
    console.error('SRC', src);
    var test = new lib.Test();
    test.expectVT(e, 'pass');
    test.set('objPath', objPath);
    test.set('src', src);
    isStmt && test.set('stmt', isStmt);
    test.name = name;
    ts.add(test);
  };
}

 module.exports.createTranspilerTester = createTranspilerTester;
