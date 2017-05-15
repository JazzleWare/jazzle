var lib = require('../lib.js');
var util = require('../../common/util.js');
var fs = require('fs');
var path = require('path');

function createParserTester(tparser, tdir) {
  var ts = new lib.TestSuite('Parser-Tests');

  ts.tester.make =
  function(test) {
    var p = new tparser(test.get('src'), test.get('options'));
    return p;
  };

  ts.tester.run =
  function(tester, test) {
    return tester.parseProgram();
  };

  ts.comp.fail =
  function(e,a) {
    var comp = util.compare_ea(e, a, null, util.ej_adjust);
    return { value: comp, compatible: comp === null, state: 'complete' };
  };

  ts.comp.pass = ts.comp.fail;

  ts.listener = createParserListener();

  loadParserTests(ts, tdir);

  return ts;
}

function createParserListener() {
  return {
    notify: function(state, test) {
      this.stats[state].total++;
      if (state !== 'ignore')
        this.stats[state][this.geci()]++;
    },
    stats: {
      pass: { g: 0, e: 0, c: 0, i: 0, total: 0 },
      ignore: { total: 0 },
      fail: { g: 0, e: 0, c: 0, i: 0, total: 0 }
    }
  };
}

function loadParserTests(t, dir) {
  util.eachDirItem(dir, function iter(base, item) {
    var stat = null, fullPath = path.join(base, item);
    stat = fs.statSync(fullPath); 
    if (stat.isFile()) {
      var test = loadPossibleTest(fullPath);
      test && t.add(test);
      return;
    }
    if (stat.isDirectory())
      return util.dirIter(fullPath, iter);
  });
}

function loadPossibleTest(uri) {
  var isSource = true;
  var i = util.tailIndex(uri, '.source.js');
  if (i === -1) {
    isSource = false;
    i = util.tailIndex(uri, 'js');
    if (i === -1)
      return null;
  }

  var t = new lib.Test();

  t.set('uri', uri);

  var o = {};
  t.set('options', o);

  var bareName = uri.substring(0,i);
  t.name = bareName;

  var jsonUri = "", json = "";
 
  IDENTIFY: {
    try {
      jsonUri = bareName+'.failure.json';
      json = fs.readFileSync(jsonUri);
      test.expectVT(null, 'fail');
      test.set('json-type', 'failure');
      break IDENTIFY;
    } catch (err) {}

    try {
      jsonUri = bareName+'.module.json';
      json = fs.readFileSync(jsonUri);
      test.expectVT(null, "");
      test.set('json-type', 'module');
      break IDENTIFY;
    } catch (err) {}

    try {
      jsonUri = bareName+'.tree.json';
      json = fs.readFileSync(jsonUri);
      test.expectVT(null, "");
      test.set('json-type', 'tree');
      break IDENTIFY;
    } catch (err) {}

    try {
      jsonUri = bareName+'.tokens.json';
      json = fs.readFileSync(jsonUri);
      test.expectVT(null, 'pass');
      test.set('json-type', 'tokens');
      break IDENTIFY;
    } catch (err) {}

    ASSERT.call(this, false, 'Unknown type for test <'+bareName+'>');
  }

  json = test.expected.value = JSON.parse(json);
  if (test.expected.type === "")
    test.expected.type = !json.errors ? 'pass' : 'fail';

  o.sourceType = 
    (json.sourceType === 'module' ||
    test.get('json-type') === 'module') ? 'module' : 'script';

  var rawSrc = fs.readFileSync(uri);

  var src = rawSrc;
  if (isSource)
    src = eval('(function(){'+src+';return source;}())');

  test.set('src', src);
  test.set('rawSrc', rawSrc);

  return test;
}

 module.exports.createParserTester = createParserTester;
 module.exports.createParserListener = createParserListener;
 module.exports.loadParserTests = loadParserTests;
 module.exports.loadPossibleTest = loadPossibleTest;
