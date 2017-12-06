'use strict';
var DIST_OUTPUT_LOCATION = './dist/jazzle';
var ROOT_PATH = './src';
var ROOT_FILE = './src/goal.js';

console.error("--------------------BUILD STARTED------------------------");
var jazzle = null;

try {
  console.error('----------BOOTSTRAPPING-------');
  jazzle = require('../dist/jazzle.js');
  console.error('----------FOUND JAZZLE--------');
} 
catch (e) {
  console.error('---------COULD NOT FIND JAZZLE; FALLING BACK TO EMERGENCY ONE-----------');
  try {
    jazzle = require('../emergency-bootstrapping/jazzle.js');
    console.error('FOUND JAZZLE FOR EMERGENCY');
  }
  catch (e) {
    throw new Error('COULD NOT FIND JAZZLE; STOPPING');
  }
}

console.error('LOADING JAZZLE COMPLETE.');

var fs = require('fs');

var FileResourceResolver = jazzle.FileResourceResolver;

function build(targetFileName, minify, emitter) {
  var rootSource = fs.readFileSync(ROOT_FILE, 'utf-8').toString();

  var result = jazzle.transform(rootSource, {
    sourceType: 'module',
    rootUri: ROOT_FILE,
    resolver: new FileResourceResolver(fs),
    bundle: true,
    minify: minify,
    emitter: emitter
  });
  
  var exports = {};

  console.log("<WRITING FIRST>");

  var outName = targetFileName+'.js', smName = outName + '.sourcemap';
  fs.writeFileSync(outName, result.code + '\n//# sourceMappingURL=' + '../' + smName );
  fs.writeFileSync(smName, result.sourceMap);
  console.log("<WRITING COMPLETE>");
  
  console.log("TESTING.....");
  
  try {
     new Function(result.code).call(exports);
  
     exports = exports.jazzle;
  
     var ts = require('../test/testers/parser.js')
       .createParserTester(exports.Parser, './test/assets/test-esprima','.ignore');
     ts.runAll();
  
     ts = require('../test/testers/transpiler.js')
       .createTranspilerTester(exports.Parser,exports.Transformer,exports.Emitter);
     ts.runAll();
  
     ts = require('../test/testers/regex.js')
        .createRegexTester(exports.Parser, [
          { flags: "", path: './test/assets/regex/test-data.json' },
          { flags: "", path: './test/assets/regex/test-data-nonstandard.json' },
          { flags: "u", path: './test/assets/regex/test-data-unicode.json' }
        ]);
     ts.runAll();
  
     console.log("TESTING COMPLETE.");
  }
  catch (e) {
     console.log("ERROR:\n", e);
  }
  
  console.log("---------------------BUILDING COMPLETE.-----------------------------");
}

var Emitter = null; Emitter = jazzle.Emitter;
var emitter = null;

emitter = new Emitter();
build( DIST_OUTPUT_LOCATION, false, emitter);

emitter = new Emitter();
emitter.allow.space = false;
emitter.allow.nl = false;
emitter.allow.comments.l = false;
emitter.allow.comments.m = false;
build( DIST_OUTPUT_LOCATION+'.min', false, emitter);emitter = new Emitter();

emitter.allow.comments.m = false;
emitter.allow.comments.l = false;
build( DIST_OUTPUT_LOCATION+'.nocomments', false, emitter);
