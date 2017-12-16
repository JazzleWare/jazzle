var util = require('../../common/util.js');

function Test() {
  this.uri = "";
  this.jsonMode = "";
  this.source = { value: "", raw: "" };
  this.parser = null;
  this.json = null;
  this.result = null;
  this.resultType = "";
}

Test.prototype.isFail = function() {
  return this.json.error || this.jsonMode === 'err';
};

Test.prototype.isModule = function() {
  if (this.uri === "")
    throw new Error("isModule called on a test that has not yet been loaded");
  
  return util.tailIndex(this.uri, ".module.js") !== -1 ||
    this.json.sourceType === 'module' || this.jsonMode === 'module';
};

Test.prototype.setResult = function(result, rtype) {
  this.result = result;
  this.resultType = rtype;
};

{module.exports.Test = Test;}

