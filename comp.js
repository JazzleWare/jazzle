var jazzle = require('./dist/jazzle.js');
var util = require('./common/util.js');
var fs = require('fs');
var esprima = require('esprima');

var i = 2;
var testFile = process.argv[i++];
var contents = "";

contents = testFile[0] === ':' ?
  testFile.substr(1) :
  fs.readFileSync(testFile, 'utf-8');

var isModule = process.argv[i++] !== 'n';
var astLocation = i < process.argv.length ? process.argv[i++] : "";
var ast_esprima = astLocation === "" ? esprima.parse(contents,
  {loc: true, range: true, sourceType: isModule ? 'module' : 'script', tokens:true}) :
  JSON.parse(fs.readFileSync(astLocation, 'utf-8'));

var jo = {};
jo.sourceType = isModule ? 'module' : 'script';
jo.onToken = [];

console.error("<JAZZLE>")
var ast_jazzle = jazzle.parse(contents, jo);

console.log("</JAZZLE>");

var comp = util.compare_ea(ast_esprima, ast_jazzle, null, util.ej_adjust);
if (comp === null)
  console.log('equal parses.');
else {
  console.log('incompatible parses; comparison:');
  console.log(util.obj2str(comp));
}

