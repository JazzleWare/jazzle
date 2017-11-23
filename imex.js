var jazzle = require('./dist/jazzle.js');
var fs = require('fs');
var AutoImex = jazzle.AutoImex;
var autimex = new AutoImex();

autimex.Parser = jazzle.Parser;
autimex.loadSource =
function(uri) {
  return fs.readFileSync(uri, 'utf-8').toString();
};

var list = null; list = process.argv;
var l = 2;

console.log('LIST', list);

while (l < list.length)
  autimex.insertSourceByURI(list[l++]);

autimex.resolveAll();
