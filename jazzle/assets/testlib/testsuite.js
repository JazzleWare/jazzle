var fs = require('fs'), util = require('../../common/util.js');

function TestSuite() {
  this.hits = {};
  this.ignoreList = [];
  this.listener = null;
  this.parserFactory = null;
}

function readFile(name) {
  try {
    return fs.readFileSync(name, 'utf-8');
  }
  catch (err) {
//  console.error('<'+name+'>: '+err.message);
    return null;
  }
}

function getTestName(uri) {
  var tailIndex = util.tailIndex(uri, '.source.js');
  if (tailIndex === -1)
    tailIndex = util.tailIndex(uri, '.js');
  if (tailIndex === -1)
    return "";
  return uri.substring(0, tailIndex);
}

TestSuite.prototype.notify = function(mode, submode, test) {
  if (this.listener === null)
    return null;
   
  return this.listener.on(mode, submode, test);
};

TestSuite.prototype.init = function(test) {
  if (test.uri === "")
    throw new Error("test suite can not run a test that does not even have a uri!");

  this.loadTest(test);
  test.parser = new this.parserFactory(test.source.value, test.isModule());
};

TestSuite.prototype.runTest = function(test) {
  if (test.json === null || test.parser === null)
    throw new Error("test suite can not run <"+test.uri+"> because it has not yet been initialised");

  var ignorer = this.findIgnorer(test);
  if (ignorer) {
    this.hits['#'+ignorer.n]++
    return this.notify(
      test.isFail() ? 'fail' : 'pass', 'ignore', test);
  }

  var result = null, comp = null;
  try {
    result = test.parser.parseProgram();
  }
  catch (err) {
    test.setResult(err, 'err');
    if (!test.isFail())
      return this.notify('fail', 'contrary', test);

    comp = util.compare_ea(test.json, test.result, null, util.ej_adjust);
    test.comp = comp;

    if (test.comp === null)
      return this.notify('fail', 'as-expected', test);

    return this.notify('fail', 'incompatible', test);
  }

  test.setResult(result, 'ast');

  if (test.isFail())
    return this.notify('pass', 'contrary', test);

  comp = util.compare_ea(test.json, test.result, null, util.ej_adjust);
  test.comp = comp;

  if (test.comp === null)
    return this.notify('pass', 'as-expected', test);

  return this.notify('pass', 'incompatible', test);
};

TestSuite.prototype.loadTest = function(test) {
  this.loadTestSource(test);
  this.loadTestJSON(test);
};

TestSuite.prototype.loadTestSource = function(test) {
  test.source.raw = readFile(test.uri);
  if (util.tailIndex(test.uri, '.source.js') !== -1)
    test.source.value =
      eval('(function(){'+test.source.raw+'; return source;})()');
  else
    test.source.value = test.source.raw;
};

TestSuite.prototype.loadTestJSON = function(test) {
  var testName = getTestName(test.uri);
  if (testName === "")
    throw new Error("no test name was calculated for <"+test.uri+">");

  var jsonContents = null, jsonMode = "";
  if (jsonContents === null) {
    jsonContents = readFile(testName+'.failure.json');
    jsonMode = "err";
  }
  if (jsonContents === null) {
    jsonContents = readFile(testName+'.module.json');
    jsonMode = "module";
  }
  if (jsonContents === null) {
    jsonContents = readFile(testName+'.tree.json');
    jsonMode = "ast";
  }

  if (jsonContents === null) {
    jsonContents = readFile(testName+'.tokens.json');
    jsonMode = "token";
  }

  if (jsonContents === null)
    throw new Error("no json for <"+testName+">");

  test.json = JSON.parse(jsonContents);
  test.jsonMode = jsonMode;
};

TestSuite.prototype.findIgnorer = function(test) {
  var i = 0, list = this.ignoreList;
  while (i < list.length) {
    if (list[i].fn.call(this, test))
      return list[i];
    i++;
  }

  return null;
};

TestSuite.prototype.ignore = function(name, ignorer) {
  if (!this.hits.hasOwnProperty('#'+name))
    this.hits['#'+name] = 0;

  this.ignoreList.push({ fn: ignorer, n: name });
};

{module.exports.TestSuite = TestSuite;}
