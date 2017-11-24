function rewrite(str, rules) {
  var r = 0;
  while (r < rules.length) {
    var rule = rules[r++];
    if (rule === null)
      break;
    if (str.match(rule.regex()))
      return str.replace(rule.regex(), rule.sub);
  }
  if (rule || r < rules.length)
    throw new Error('not match for ['+str+']');

  return str;
}

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

console.error('LIST', list);

while (l < list.length)
  autimex.insertSourceByURI(list[l++]);

autimex.resolveAll();

autimex.onStartImports =
function(elem) {
  console.log('starting ['+elem['#uri']+']');
};

autimex.onImport =
function(o) {
  console.log('  import ['+o.str+'] from ['+o.from+'] to ['+o.to+']');
};

autimex.onFinishImports =
function(elem) {
  console.log('finish ['+elem['#uri']+']\n');
};

autimex.onStartExports =
function(elem) {};

autimex.onFinishExports =
function(elem) {};

autimex.flush();


