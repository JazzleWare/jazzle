var TestSuite = require('./lib/testsuite.js').TestSuite;
var Test = require('./lib/test.js').Test;
var fs = require('fs');
var path = require('path');
var util = require('../common/util.js');

var listener = {
  on: function(mode, submode, test) {
    console.error(mode, submode, test.uri, '['+test.getSettings()+']');
    if (submode === 'contrary') {
      console.error('<result>', util.obj2str(test.result), '\n');
      console.error('<comp>', util.obj2str(test.comp), '\n');
      throw new Error(test);
    }

    this.stats[mode].count++;
    this.stats[mode][submode]++;
  },
  stats: {
    pass: { 'incompatible': 0, 'as-expected': 0, 'contrary': 0, 'ignore': 0, count: 0 },
    fail: { 'incompatible': 0, 'as-expected': 0, 'contrary': 0, 'ignore': 0, count: 0 }
  }
};

var util = require('../common/util.js'), ignoreFile = './.ignore';
function runTests(parserFactory, testRoot) {
  var testSuite = new TestSuite();
  testSuite.parserFactory = parserFactory;
  testSuite.listener = listener;

  testSuite.ignore('.tolerant', function(test) { return test.uri.indexOf('tolerant') !== -1 });
  testSuite.ignore('.comments', function(test) { return test.json.comments });
  testSuite.ignore('.lineNumber', function(test) { return false && test.json.hasOwnProperty('lineNumber') });
  testSuite.ignore('.js.xml', function(test) { return test.uri.indexOf('JSX') !== -1 });
  testSuite.ignore('.tokens',function(test) { return test.jsonMode === 'token' });

  fs.readFileSync('.ignore').toString().split('\n')
    .forEach(function(line) {

      line = line.replace(/^\s*([^#\s]*)\s*(#.*)?$/, "$1");
      if (line === "")
        return;

      console.error('ignore <'+line+'>');
      
      testSuite.ignore('.js:list-ignore', function(test) { return test.uri === line+'.js'; });
      testSuite.ignore('.source.js:list-ignore', function(test) { return test.uri === line+'.source.js'; });
    });

  function onItem(itemPath, iter) {
//  console.error('item <'+itemPath+'>');
    var stat = fs.statSync(itemPath);
    if (!stat.isFile()) {
      if (stat.isDirectory())
        iter(itemPath, onItem);

      return;
    }

    var tailIndex = util.tailIndex(itemPath, '.js');
    if (tailIndex === -1)
      return;

    var test = new Test();
    test.uri = itemPath;

    console.error('<start>', test.uri);
    testSuite.loadTest(test);
    testSuite.init(test);
    testSuite.runTest(test);
  }

  console.error("STARTED");
  try {
    util.dirIter(testRoot, onItem);
    console.error("FINISHED WITH NO ERRORS.");
  }
  catch (err) {
    console.error("ABORTED.");
    throw err; 
  }

  console.error("IGNORE:");
  console.error(testSuite.hits);

  console.error("STATS:");
  console.error(listener.stats);
}

{module.exports.runTests = runTests;}
