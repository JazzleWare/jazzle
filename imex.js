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

var RULES = [
  {regex: function() { return /^([^@]*)$/; }, sub: "./other/$1"},
  {regex: function() { return /^@(.*)\.js$/; }, sub: "./$1/cls.js"},
  {regex: function() { return /^(.+)@(.+).js$/; }, sub: "./$2/$1.js"}
];

var jazzle = require('./dist/jazzle.js');
var fs = require('fs');
var AutoImex = jazzle.AutoImex;
var autimex = new AutoImex();
var manp = new jazzle.PathMan;

autimex.Parser = jazzle.Parser;
autimex.loadSource =
function(uri) {
  return fs.readFileSync(uri, 'utf-8').toString();
};

var logE = function() {
  var log = autimex.logE;
  function none() {}
  function logE() { return log.apply(this, arguments); }
  return function (l) {
    return l ? logE : none;
  };
}();
autimex.logE = function() {};

var list = null; list = process.argv;
var l = 2;

logE(0)('LIST', list);

while (l < list.length)
  autimex.insertSourceByURI(list[l++]);

autimex.resolveAll();

autimex.onStartImports =
function(elem) {
  logE(1)('starting ['+elem['#uri']+']');
};

autimex.onImport =
function(o) {
  var rewrittenFrom = rewrite(manp.tail(o.from), RULES);
  var rewrittenTo = rewrite(manp.tail(o.to), RULES);

  console.log('  import ['+o.str+'] from ['+o.from+'='+rewrittenFrom+'] to ['+o.to+'=' + rewrittenTo+']');
};

autimex.onFinishImports =
function(elem) {
  var scope = elem['#scope'], uri = elem['#uri'];
  var sub = manp.tail(uri);
  var rewrittenTo = rewrite(sub, RULES);

  if (scope['#clsThisList'] && scope['#clsThisList']) {
    var m = sub.substring(sub.indexOf('@')+1, sub.lastIndexOf('.js'));
    logE(0)('clsThisList', m, 12, scope['#clsThisList']);
    var im = autimex.clsUriList[m+'%'];
    var rewrittenFrom = rewrite(manp.tail(im), RULES);
    console.log('  import {cls} from '+'['+im+'='+rewrittenFrom+'] to ['+uri+'='+rewrittenTo+']');
  }

  logE(1)('finish ['+elem['#uri']+']\n');
};

autimex.onStartExports =
function(elem) {};

autimex.onFinishExports =
function(elem) {};

autimex.flush();
