var lib = require('../lib.js');
var util = require('../../common/util.js');
var fs = require('fs');
var path = require('path');
var ASSERT = util.ASSERT;

function createParserTester(tparser, tdir, tignore) {
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

  ts.comp.pass =
  function(e,a) {
    util.prog_adjust(e,a,null);
    return ts.comp.fail.call(this,e,a);
  };

  ts.listener = createParserListener();

  loadParserTests(ts, tdir);

  loadIgnores(ts, tignore);

  return ts;
}

function loadIgnores(ts, tignore) {
  ts.addIgnorer('.tolerant', function(test) { return test.get('uri').indexOf('tolerant') !== -1 });
  ts.addIgnorer('.comments', function(test) { return test.expected.value.comments });
  ts.addIgnorer('.lineNumber', function(test) { return false && test.expected.value.hasOwnProperty('lineNumber') });
  ts.addIgnorer('.js.xml', function(test) { return test.get('uri').indexOf('JSX') !== -1 });
  ts.addIgnorer('.tokens',function(test) { return test.get('json-type') === 'tokens' });

  fs.readFileSync(tignore).toString().split('\n')
    .forEach(function(line) {

      line = line.replace(/^\s*([^#\s]*)\s*(#.*)?$/, "$1");
      if (line === "")
        return;

      console.error('ignore <'+line+'>');
      
      ts.addIgnorer('.js:list-ignore', function(test) { return test.get('uri') === line+'.js'; });
      ts.addIgnorer('.source.js:list-ignore', function(test) { return test.get('uri') === line+'.source.js'; });
    });
  
}  

var NAMES = { g: 'ignore', e: 'compatible', c: 'contrary', i: 'non-matching' };
function createParserListener() {
  return {
    notify: function(state, test) {
      if (test && test.contrary() && test.actual.type !== 'fail')
        console.error(test, state);
      if (state === 'complete') {
        this.stats[test.actual.type].total++;
        this.stats[test.actual.type][test.geci()]++;
      }
      else if (state === 'finish') 
        console.error(this.stats);

      if (state !== 'finish')
        console.error(
          state + '[ex='+test.expected.type+' got='+test.actual.type+']',
          NAMES[test.geci()],
          test.name
        );

      if (test && test.contrary()) {
        console.error(test);
        throw new Error('actual type is not matching the expected type');
      }
          
    },
    stats: {
      pass: { g: 0, e: 0, c: 0, i: 0, total: 0 },
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
      return util.eachDirItem(fullPath, iter);
  });
}

function loadPossibleTest(uri) {
  var isSource = true, isModule = false;
  var i = util.tailIndex(uri, '.source.js');
  if (i === -1) {
    isSource = false;
    i = util.tailIndex(uri, '.module.js');
    if (i !== -1)
      isModule = true;

    i = util.tailIndex(uri, '.js');
    if (i === -1)
      return null;
  }

  var t = new lib.Test();

  var o = {};
  t.set('options', o);

  t.set('uri', uri);


  var bareName = uri.substring(0,i);
  t.name = bareName;

  var jsonUri = "", json = "";
 
  IDENTIFY: {
    try {
      jsonUri = bareName+'.failure.json';
      json = fs.readFileSync(jsonUri);
      t.expectVT(null, 'fail');
      t.set('json-type', 'failure');
      break IDENTIFY;
    } catch (err) {}

    try {
      jsonUri = bareName+'.module.json';
      json = fs.readFileSync(jsonUri);
      t.expectVT(null, "");
      t.set('json-type', 'module');
      break IDENTIFY;
    } catch (err) {}

    try {
      jsonUri = bareName+'.tree.json';
      json = fs.readFileSync(jsonUri);
      t.expectVT(null, "");
      t.set('json-type', 'tree');
      break IDENTIFY;
    } catch (err) {}

    try {
      jsonUri = bareName+'.tokens.json';
      json = fs.readFileSync(jsonUri);
      t.expectVT(null, 'pass');
      t.set('json-type', 'tokens');
      break IDENTIFY;
    } catch (err) {}

    ASSERT.call(this, false, 'Unknown type for test <'+bareName+'>');
  }

  json = t.expected.value = JSON.parse(json);
  if (t.expected.type === "")
    t.expected.type = !json.errors ? 'pass' : 'fail';

  o.sourceType = 
    isModule ||
    (json.sourceType === 'module' ||
    t.get('json-type') === 'module') ? 'module' : 'script';

  var rawSrc = fs.readFileSync(uri).toString();

  var src = rawSrc;
  if (isSource)
    src = eval('(function(){'+src+';return source;}())');

  t.set('src', src);
  t.set('rawSrc', rawSrc);

  return t;
}

  module.exports.createParserTester = createParserTester;
  module.exports.createParserListener = createParserListener;
  module.exports.loadParserTests = loadParserTests;
  module.exports.loadPossibleTest = loadPossibleTest;
