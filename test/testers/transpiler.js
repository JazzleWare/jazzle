var util = require('../../common/util.js');
var ASSERT = util.ASSERT;
var HAS = util.HAS;
var lib = require('../lib.js');

function createTranspilerTester(Parser, Transformer, Emitter) {
  var ts = new lib.TestSuite('Transpiler-Suite');
  ts.tester.make =
  function(test) {
    var objPath = test.get('objPath'),
        n = new Parser(test.get('src'), test.get('options')).parseProgram();
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
      t: new Transformer()
    };
  };

  ts.tester.run =
  function(tester, test) {
    var n = tester.n, e = tester.e, t = tester.t;
    e.emitAny(t.tr(n, !test.get('stmt')), test.get('stmt') ? 2 : 0, test.get('stmt') || false);
    return e.code ;
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

  loadTranspilerTests(ts);

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

  mt('literal-string-single', "'a'", "'a'", o);
  mt('literal-string-multi',"\"a\"", "'a'", o);
  mt('literal-num', "120", "120", o);
  mt('literal-double', "5.5", "5.5", o);
  mt('literal-0', "0", "0", o);
  mt('literal-float0', "0.5", "0.5", o);
  mt('literal-sign-num', ".12", (.12)+"", o);
  mt('binary-expression', "5 * 5", "5 * 5", o);
  mt('binary-expression', "(5 * 5) * 5", "5 * 5 * 5", o);
  mt('binary-expression', "5 * (5 * 5)", "5 * (5 * 5)", o);
  mt('binary-expression', "5 * (5 - 5)", "5 * (5 - 5)", o);
  mt('binary-expression', "5 * 5 - 5", "5 * 5 - 5", o);
  mt('string-esc', "'\\\"'", "'\\\"'", o);
  mt('string-esc', "'\\b\\v\\f\\t\\r\\n\\\\\\\"\\\''", "'\\b\\v\\f\\t\\r\\n\\\\\\\"\\\''", o);
  mt('new', "new 5()", "new 5()", o);
  mt('new', "new (new 5)", "new new 5()()", o);
  mt('new', "new new 5", "new new 5()()", o);
  mt('new', "new (-5)", "new (-5)()", o);
  mt('new', "new (new (-5))", "new new (-5)()()", o);
  mt('new', "new (5 * 12)", "new (5 * 12)()", o);
  mt('new', "(new 5) * 12", "new 5() * 12", o);
  mt('new', "new 5(new 5, 5)", "new 5(new 5(), 5)", o);

  
  mt('block', "{}", "{}", e, true );
  mt('block', "{{}}", "{\n  {}\n}", e, true );
  mt('block', "{{}{}}", "{\n  {}\n  {}\n}", e, true );
  mt('block', "{{{{}}{{}}}}", "{\n  {\n    {\n      {}\n    }\n    {\n      {}\n    }\n  }\n}", e, true );
  mt('if', "if (5) {}", "if (5) {}", e, true );
  mt('ifElse', "if (5) {} else {}", "if (5) {}\nelse {}", e, true );
  mt('ifElseIf', "if (5) {} else if (12) {}", "if (5) {}\nelse if (12) {}", e, true );
  mt('ifElseIfElse', "if (5) {} else if (12) {} else {}", "if (5) {}\nelse if (12) {}\nelse {}", e, true );
  mt('stmtexpr', "5;", "5;", e, true );
  mt('stmtexpr', "{5}", "{\n  5;\n}", e, true );
  mt('stmtexpr', "5", "5;", e, true );
  mt('stmtexpr', "{{}5}", "{\n  {}\n  5;\n}", e, true );
  mt('stmtexpr', "if (5) new 12; else 5", "if (5)\n  new 12();\nelse\n  5;", e, true );
  mt('stmtexpr', "{if(5) new 12; else 5; if (5) 12; else new 5()}", "{\n  if (5)\n    new 12();\n  else\n    5;\n  if (5)\n    12;\n  else\n    new 5();\n}", e, true );

}

function buildTestBuilder(ts) {
  return function makeTest(name, src, e, objPath, isStmt) {
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
