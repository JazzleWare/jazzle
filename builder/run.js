'use strict';
var DIST_OUTPUT_LOCATION = './dist/jazzle.js';
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

var PathMan = jazzle.PathMan;
var Transformer = jazzle.Transformer;
var Emitter = jazzle.Emitter;
var Parser = jazzle.Parser;
var Bundler = jazzle.Bundler;

var rootSource = fs.readFileSync(ROOT_FILE, 'utf-8').toString();

// set up a path manager for the bundler to use
var pathMan = new PathMan();

// set up a bundler, and give it a path manager to use
var bundler = new Bundler(pathMan);

// set up a resolver so the bundler can find the contents of 'import's
var resolver = new FileResourceResolver(fs);

// give the bundler the resolver we set a few lines ago
bundler.resolver = resolver;

// tell the bundler where to start from
bundler.setURIAndDir(ROOT_FILE, ROOT_PATH);

// set up a parser for the root source
var parser = new Parser(rootSource, {sourceType: 'module'});

// tell parser what bundler to use for managing its import/export declarations
parser.bundler = bundler;

// tell the resolver and the parser what master-scope the sources they deal with
// is contained in. TODO: this is unnecessary, and should be eliminated ASAP
parser.bundleScope = bundler.bundleScope;
resolver.bundleScope = bundler.bundleScope;

// parse the root source, and give that to the bundler
var rootNode = parser.parseProgram();
bundler.rootNode = rootNode;

// create a transformer, and transform the bundler into something emittable
var transformer = new Transformer();
var transformedBundleNode = transformer.tr(bundler, false);

// create an emitter
var emitter = new Emitter();

// kickstart the emitter; TODO: eliminate
emitter.start();

// emit! this is what we have come all the way for!
emitter.emitStmt(transformedBundleNode);

// flush anything that might still be pending in the emitter
emitter.flushAll();

// YAY! SHOW IT TO THE WORLD!
// console.log(emitter.out);

var exports = {};

console.log("<WRITING FIRST>");
fs.writeFileSync(DIST_OUTPUT_LOCATION, emitter.out);

console.error(emitter.sm);
console.log("<WRITING COMPLETE>");

console.log("TESTING.....");

try {
   new Function(emitter.out).call(exports);

   // console.error('E', exports);
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
// dist += ".error";  
// builder.write(fs .openSync(dist+'.js', 'w+'));
}

// builder.write(fs .openSync(dist+'.js', 'w+'));
console.log("---------------------BUILDING COMPLETE.-----------------------------");
