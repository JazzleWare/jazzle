var jazzle = require('../dist/jazzle.js');
var ResourceResolver = jazzle.ResourceResolver;
var fs = require('fs');
var Parser = jazzle.Parser;

function ASSERT(condition, message) {
  if (!condition)
    throw new Error(message);
}

function FileResourceResolver() {
  ResourceResolver.call(this);
}

FileResourceResolver.prototype.asNode =
function(uri) {
  var src = fs.readFileSync(uri, 'utf-8').toString();
  var newParser = new Parser(src, {sourceType: 'module'});
  newParser.bundleScope = this.bundleScope;
  return newParser.parseProgram();
}

 module.exports.FileResourceResolver = FileResourceResolver;
