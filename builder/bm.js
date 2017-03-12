var macro = require('../common/macro.js');
var Macro = macro.Macro;
var buildMacro = new Macro();
 module.exports.buildMacro = buildMacro;
if (true) {
  buildMacro.define('V');

  buildMacro.preprocessors.push(function(str) {
    str = str.toString();
    return str.replace(/\/\*\s*(,y:-1)\s*\*\//g, " $1");
  });
}

