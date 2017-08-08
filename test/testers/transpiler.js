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
    return e.flush(), e.out;
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
    "if (5) {}",
    "if (5) {}",
    e, true );

  mt('ifElse', "if (5) {} else {}", "if (5) {}\nelse {}", e, true );
  mt('ifElse-cmn',
    "if (5) {} else {}",
    "if (5) {}\nelse {}",
    e, true );

  mt('ifElseIf', "if (5) {} else if (12) {}", "if (5) {}\nelse if (12) {}", e, true );
  mt('ifElseIf-cmn',
    "if (5) {} else if (12) {}",
    "if (5) {}\nelse if (12) {}",
    e, true );

  mt('ifElseIfElse', "if (5) {} else if (12) {} else {}", "if (5) {}\nelse if (12) {}\nelse {}", e, true );
  mt('ifElseIfElse-cmn',
    "if (5) {} else if (12) {} else {}",
    "if (5) {}\nelse if (12) {}\nelse {}",
    e, true );

  mt('stmtexpr', "5;", "5;", e, true );
  mt('stmtexpr-cmn',
    "5;",
    "5;",
    e, true );

  mt('stmtexpr', "{5}", "{\n  5;\n}", e, true );
  mt('stmtexpr-cmn',
    "{5}",
    "{\n  5;\n}",
    e, true );

  mt('stmtexpr', "5", "5;", e, true );
  mt('stmtexpr-cmn',
    "5",
    "5;",
    e, true );

  mt('stmtexpr', "{{}5}", "{\n  {}\n  5;\n}", e, true );
  mt('stmtexpr-cmn',
    "{{}5}",
    "{\n  {}\n  5;\n}",
    e, true );

  mt('stmtexpr', "if (5) new 12; else 5", "if (5)\n  new 12();\nelse\n  5;", e, true );
  mt('stmtexpr-cmn',
    "if (5) new 12; else 5",
    "if (5)\n  new 12();\nelse\n  5;",
    e, true );

  mt('stmtexpr', "{if(5) new 12; else 5; if (5) 12; else new 5()}", "{\n  if (5)\n    new 12();\n  else\n    5;\n  if (5)\n    12;\n  else\n    new 5();\n}", e, true );
  mt('stmtexpr-cmn',
    "{if(5) new 12; else 5; if (5) 12; else new 5()}",
    "{\n  if (5)\n    new 12();\n  else\n    5;\n  if (5)\n    12;\n  else\n    new 5();\n}",
    e, true );

  mt('call-5(5)', "5(5)", "5(5);", e, true);
  mt('call-5(5)-cmn',
    "5(5)",
    "5(5);",
    e, true);

  mt('call-5(5,5)', "5(5,5)", "5(5, 5);", e, true);
  mt('call-5(5,5)-cmn',
    "5(5,5)",
    "5(5, 5);",
    e, true);

  mt('call-5[5](5)', "5[5](5)", "5[5](5);", e, true);
  mt('call-5[5](5)-cmn',
    "5[5](5)",
    "5[5](5);",
    e, true);

  mt('call-5(...5)', "5(...5)", "jz.c(5, jz.arr(jz.sp(5)));", e, true);
  mt('call-5(...5)-cmn',
    "5(...5)",
    "jz.c(5, jz.arr(jz.sp(5)));",
    e, true);

  mt('call-5(5,...5)', "5(5,...5)", "jz.c(5, jz.arr([5], jz.sp(5)));", e, true);
  mt('call-5(5,...5)-cmn',
    "5(5,...5)",
    "jz.c(5, jz.arr([5], jz.sp(5)));",
    e, true);

  mt('call-5[5](...5)', "5[5](...5)", "jz.cm(t0 = 5, t0[5], jz.arr(jz.sp(5)));", e, true);
  mt('call-5[5](...5)-cmn',
    "5[5](...5)",
    "jz.cm(t0 = 5, t0[5], jz.arr(jz.sp(5)));",
    e, true);

  mt('new-5(5)', "new 5(5)", "new 5(5);", e, true);
  mt('new-5(5)-cmn',
    "new 5(5)",
    "new 5(5);",
    e, true);

  mt('new-5(...5)', "new 5(...5)","jz.n(5, jz.arr(jz.sp(5)));", e, true);
  mt('new-5(...5)', "new 5(...5)","jz.n(5, jz.arr(jz.sp(5)));", e, true);

  mt('[a]', '[a]', '[a];', e, true);
  mt('[a]', '[a]', '[a];', e, true);

  mt('[a,b]', '[a,b]', '[a, b];', null, true);
  mt('[a,b]', '[a,b]', '[a, b];', null, true);

  mt('[a,b,e]', '[a,b,e]', '[a, b, e];', null, true);
  mt('[a,b,e]', '[a,b,e]', '[a, b, e];', null, true);

  mt('[a,]', '[a,]', '[a];', null, true);
  mt('[a,]', '[a,]', '[a];', null, true);

  mt('[,a]', '[,a]', '[void 0, a];', null, true);
  mt('[,a]', '[,a]', '[void 0, a];', null, true);

  mt('[,5,]', '[,5,]', '[void 0, 5];', null, true);
  mt('[,5,]', '[,5,]', '[void 0, 5];', null, true);

  mt('[,]', '[,]', '[void 0];', null, true);
  mt('[,]', '[,]', '[void 0];', null, true);

  mt('[...5]', '[...5]', 'jz.arr(jz.sp(5));', null, true);
  mt('[...5]', '[...5]', 'jz.arr(jz.sp(5));', null, true);

  mt('[...5,]', '[...5,]', 'jz.arr(jz.sp(5));', null, true);
  mt('[...5,]', '[...5,]', 'jz.arr(jz.sp(5));', null, true);

  mt('[...5,,]', '[...5,,]', 'jz.arr(jz.sp(5), [void 0]);', null, true);
  mt('[...5,,]', '[...5,,]', 'jz.arr(jz.sp(5), [void 0]);', null, true);

  mt('[,...5]', '[,...5]','jz.arr([void 0], jz.sp(5));', null, true);
  mt('[,...5]', '[,...5]','jz.arr([void 0], jz.sp(5));', null, true);

  mt('[,...5,]]', '[,...5,]','jz.arr([void 0], jz.sp(5));', null, true);
  mt('[,...5,]]', '[,...5,]','jz.arr([void 0], jz.sp(5));', null, true);

  mt('[...5, ...12]', '[...5, ...12]','jz.arr(jz.sp(5), jz.sp(12));', null, true);
  mt('[...5, ...12]', '[...5, ...12]','jz.arr(jz.sp(5), jz.sp(12));', null, true);

  mt('[5,...12,12,...5]', '[5,...12,12,...5]','jz.arr([5], jz.sp(12), [12], jz.sp(5));', null, true);
  mt('[5,...12,12,...5]', '[5,...12,12,...5]','jz.arr([5], jz.sp(12), [12], jz.sp(5));', null, true);

  mt('[5,...12,12,...5,40]', '[5,...12,12,...5,40]','jz.arr([5], jz.sp(12), [12], jz.sp(5), [40]);', null, true);
  mt('[5,...12,12,...5,40]', '[5,...12,12,...5,40]','jz.arr([5], jz.sp(12), [12], jz.sp(5), [40]);', null, true);

  mt('5(5,)', '5(5,)', '5(5);', null, true);
  mt('5(5,)', '5(5,)', '5(5);', null, true);

  mt('({a:b})', '({a:b})', '({a: b});', null, true);
  mt('({a:b})', '({a:b})', '({a: b});', null, true);

  mt('({a:b,e})', '({a:b,e})', '({a: b, e: e});', null, true);
  mt('({a:b,e})', '({a:b,e})', '({a: b, e: e});', null, true);

  mt('{{a,b:e})', '({a,b:e})', '({a: a, b: e});', null, true);
  mt('{{a,b:e})', '({a,b:e})', '({a: a, b: e});', null, true);

  mt('({a,b})', '({a,b})', '({a: a, b: b});', null, true);
  mt('({a,b})', '({a,b})', '({a: a, b: b});', null, true);

  mt('({a,b,})', '({a,b,})', '({a: a, b: b});', null, true);
  mt('({a,b,})', '({a,b,})', '({a: a, b: b});', null, true);

  mt('({})', '({})', '({});', null, true);
  mt('({})', '({})', '({});', null, true);

  mt('({[5]:12})', '({[5]:12})', 'jz.obj({}, 5, 12);', null, true);
  mt('({[5]:12})', '({[5]:12})', 'jz.obj({}, 5, 12);', null, true);

  mt('({5:40,[12*5]:12})', '','jz.obj({5: 40}, 12 * 5, 12);', null, true);
  mt('({5:40,[12*5]:12})', '','jz.obj({5: 40}, 12 * 5, 12);', null, true);

  mt('({[5]: 12, 12: 5})', '','jz.obj({}, 5, 12, 12, 5);', null, true); 
  mt('({[5]: 12, 12: 5})', '','jz.obj({}, 5, 12, 12, 5);', null, true); 

  mt('({[a]: b, l: [w]})', '' ,'jz.obj({}, a, b, \'l\', [w]);', null, true);
  mt('({[a]: b, l: [w]})', '' ,'jz.obj({}, a, b, \'l\', [w]);', null, true);

  mt('while (false) {}', '', 'while (false) {}', null, true);
  mt('while (false) {}', '', 'while (false) {}', null, true);

  mt('while (false) {5}', '', 'while (false) {\n  5;\n}', null, true);
  mt('while (false) {5}', '', 'while (false) {\n  5;\n}', null, true);

  mt('while (false) 5;', '', 'while (false)\n  5;', null, true);
  mt('while (false) 5;', '', 'while (false)\n  5;', null, true);

  mt('while (false);', '', 'while (false);', null, true);
  mt('while (false);', '', 'while (false);', null, true);

  mt('while (false) 5; 5;', '', 'while (false)\n  5;\n5;', null, true);
  mt('while (false) 5; 5;', '', 'while (false)\n  5;\n5;', null, true);

  mt('(5).e()', '', '5 .e();', null, true);
  mt('(5).e()', '', '5 .e();', null, true);

  mt('5.5.e()', '', '5.5.e();', null, true);
  mt('5.5.e()', '', '5.5.e();', null, true);

  mt('- -5', '', '- -5;', null, true);
  mt('- -5', '', '- -5;', null, true);

  mt('- --5[5]', '', '- --5[5];', null, true);
  mt('- --5[5]', '', '- --5[5];', null, true);

  mt('-5[5]--', '', '-5[5]--;', null, true);
  mt('-5[5]--', '', '-5[5]--;', null, true);

  mt('-+5', '','-+5;',null, true);
  mt('-+5', '','-+5;',null, true);

  mt('switch (5) {}', '', 'switch (5) {}', null, true);
  mt('switch (5) {}', '', 'switch (5) {}', null, true);

  mt('switch (5) { case 12: }', '', 'switch (5) {\ncase 12:\n}', null, true );
  mt('switch (5) { case 12: }', '', 'switch (5) {\ncase 12:\n}', null, true );

  mt('switch (5) { case 40: case 12: 5() }', '', 'switch (5) {\ncase 40:\ncase 12:\n  5();\n}', null, true);
  mt('switch (5) { case 40: case 12: 5() }', '', 'switch (5) {\ncase 40:\ncase 12:\n  5();\n}', null, true);

  mt('switch (5) { case 40: 12(); case 12: }', '', 'switch (5) {\ncase 40:\n  12();\ncase 12:\n}', null, true);
  mt('switch (5) { case 40: 12(); case 12: }', '', 'switch (5) {\ncase 40:\n  12();\ncase 12:\n}', null, true);

  mt('switch (5) { default: 12() }', '', 'switch (5) {\ndefault:\n  12();\n}', null, true );
  mt('switch (5) { default: 12() }', '', 'switch (5) {\ndefault:\n  12();\n}', null, true );

  mt('switch (5) { case 12: switch (12) { case 5: }}', '', 'switch (5) {\ncase 12:\n  switch (12) {\n  case 5:\n  }\n}', null, true );
  mt('switch (5) { case 12: switch (12) { case 5: }}', '', 'switch (5) {\ncase 12:\n  switch (12) {\n  case 5:\n  }\n}', null, true );

  mt('5 ? 40 : 12', '', '5 ? 40 : 12;', null, true );
  mt('5 ? 40 : 12', '', '5 ? 40 : 12;', null, true );

  mt('(5 ? 40 : 12) ? 5 : 5 ? 40 : 12', '', '(5 ? 40 : 12) ? 5 : 5 ? 40 : 12;', null, true );
  mt('(5 ? 40 : 12) ? 5 : 5 ? 40 : 12', '', '(5 ? 40 : 12) ? 5 : 5 ? 40 : 12;', null, true );

  mt('a=5','','a = 5;', null, true);
  mt('a=5','','a = 5;', null, true);

  mt('a[b]=5','','a[b] = 5;', null, true);
  mt('a[b]=5','','a[b] = 5;', null, true);

  mt('a*=12','','a *= 12;',null,true);
  mt('a*=12','','a *= 12;',null,true);

  mt('a[b]*=12','','a[b] *= 12;',null,true);
  mt('a[b]*=12','','a[b] *= 12;',null,true);

  mt('a |= 40','','a |= 40;',null, true);
  mt('a |= 40','','a |= 40;',null, true);

  mt('a[b] |= 40','','a[b] |= 40;',null,true);
  mt('a[b] |= 40','','a[b] |= 40;',null,true);

  mt('++a','','++a;',null,true);
  mt('++a','','++a;',null,true);

  mt('++a[b]','','++a[b];',null,true);
  mt('++a[b]','','++a[b];',null,true);

  mt('a ** 1.5','','jz.ex(a, 1.5);',null,true);
  mt('a ** 1.5','','jz.ex(a, 1.5);',null,true);

  mt('a[b] ** 1.5','','jz.ex(a[b], 1.5);',null,true);
  mt('a[b] ** 1.5','','jz.ex(a[b], 1.5);',null,true);

  mt('a **= 1.5','','a = jz.ex(a, 1.5);',null,true);
  mt('a **= 1.5','','a = jz.ex(a, 1.5);',null,true);

  mt('a[b] **= 1.5','','(t0 = a)[t1 = b] = jz.ex(t0[t1], 1.5);',null,true);
  mt('a[b] **= 1.5','','(t0 = a)[t1 = b] = jz.ex(t0[t1], 1.5);',null,true);

  mt('[] = 5','','t0 = jz.arrIter(5);\nt0.end();',null,true);
  mt('[] = 5','','t0 = jz.arrIter(5);\nt0.end();',null,true);

  mt('[,] = 5','','t0 = jz.arrIter(5);\nt0.get();\nt0.end();',null,true);
  mt('[,] = 5','','t0 = jz.arrIter(5);\nt0.get();\nt0.end();',null,true);

  mt('[] = [] = 5','','t0 = jz.arrIter((t0 = jz.arrIter(5), t0.end()));\nt0.end();',null,true);
  mt('[] = [] = 5','','t0 = jz.arrIter((t0 = jz.arrIter(5), t0.end()));\nt0.end();',null,true);

  mt('[,] = [] = 5','','t0 = jz.arrIter((t0 = jz.arrIter(5), t0.end()));\nt0.get();\nt0.end();',null,true);
  mt('[,] = [] = 5','','t0 = jz.arrIter((t0 = jz.arrIter(5), t0.end()));\nt0.get();\nt0.end();',null,true);

  mt('[[]] = 5','','t0 = jz.arrIter(5);\nt1 = jz.arrIter(t0.get());\nt1.end();\nt0.end();',null,true);
  mt('[[]] = 5','','t0 = jz.arrIter(5);\nt1 = jz.arrIter(t0.get());\nt1.end();\nt0.end();',null,true);

  mt('[l] = 5','','t0 = jz.arrIter(5);\nl = t0.get();\nt0.end();',null,true);
  mt('[l] = 5','','t0 = jz.arrIter(5);\nl = t0.get();\nt0.end();',null,true);

  mt('[l,] = 5','','t0 = jz.arrIter(5);\nl = t0.get();\nt0.end();',null,true);
  mt('[l,] = 5','','t0 = jz.arrIter(5);\nl = t0.get();\nt0.end();',null,true);

  mt('a, b, e, l','','a, b, e, l;',null,true);
  mt('a, b, e, l','','a, b, e, l;',null,true);

  mt('(a,b),(e,l)','','(a, b), (e, l);',null,true);
  mt('(a,b),(e,l)','','(a, b), (e, l);',null,true);

  mt('a * b, e = l','','a * b, e = l;',null,true);
  mt('a * b, e = l','','a * b, e = l;',null,true);

  mt('(a = (b, e), l), 5','','(a = (b, e), l), 5;',null,true);
  mt('(a = (b, e), l), 5','','(a = (b, e), l), 5;',null,true);

  mt('5 ? (a,b) : (e,l)','','5 ? (a, b) : (e, l);',null,true);
  mt('5 ? (a,b) : (e,l)','','5 ? (a, b) : (e, l);',null,true);

  mt('5((a,b))','','5((a, b));',null,true );
  mt('5((a,b))','','5((a, b));',null,true );

  mt('do while(false); while(false);','','do {\n  while (false);\n} while (false);',null,true);
  mt('do while(false); while(false);','','do {\n  while (false);\n} while (false);',null,true);

  mt('do {} while (false);','','do {} while (false);',null, true);
  mt('do {} while (false);','','do {} while (false);',null, true);

  mt(';','',';',null,true);
  mt(';','',';',null,true);

  mt('a.b','','a.b;',null,true); // TODO: handle v < 5, where kws can not come as an uncomputed memname
  mt('a.b','','a.b;',null,true); // TODO: handle v < 5, where kws can not come as an uncomputed memname

  mt('a[b]','','a[b];',null,true);
  mt('a[b]','','a[b];',null,true);

  mt('(a.b)()','','a.b();',null,true);
  mt('(a.b)()','','a.b();',null,true);

  mt('(a[b])()','','a[b]();',null,true);
  mt('(a[b])()','','a[b]();',null,true);

  mt('a.b = 5','','a.b = 5;',null,true);
  mt('a.b = 5','','a.b = 5;',null,true);

  mt('a.b **= 5','','(t0 = a).b = jz.ex(t0.b, 5);',null,true);
  mt('a.b **= 5','','(t0 = a).b = jz.ex(t0.b, 5);',null,true);

  mt('[a.b] = 5','','t0 = jz.arrIter(5);\na.b = t0.get();\nt0.end();',null,true);
  mt('[a.b] = 5','','t0 = jz.arrIter(5);\na.b = t0.get();\nt0.end();',null,true);

  mt('[a=5]=12','','t0 = jz.arrIter(12);\na = jz.u(t1 = t0.get()) ? 5 : t1;\nt0.end();',null,true);
  mt('[a=5]=12','','t0 = jz.arrIter(12);\na = jz.u(t1 = t0.get()) ? 5 : t1;\nt0.end();',null,true);

  mt('[a=[b]=5]=12','','t0 = jz.arrIter(12);\na = jz.u(t1 = t0.get()) ? (t1 = jz.arrIter(5), b = t1.get(), t1.end()) : t1;\nt0.end();',null, true);
  mt('[a=[b]=5]=12','','t0 = jz.arrIter(12);\na = jz.u(t1 = t0.get()) ? (t1 = jz.arrIter(5), b = t1.get(), t1.end()) : t1;\nt0.end();',null, true);

  mt('[a,...b] = 12','','t0 = jz.arrIter(12);\na = t0.get();\nb = t0.rest();\nt0.end();',null,true);
  mt('{let a;} var a;','','{\n  var a1 = void 0;\n}',e,true);
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
