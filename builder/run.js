'use strict';
var DIST_OUTPUT_LOCATION = './dist/jazzle.js';
var ROOT_PATH = './src';
var ROOT_FILE = './src/goal.js';

var jazzle = require('../dist/jazzle.js');
var fs = require('fs');

var FileResourceResolver = require('./FileResourceResolver.js').FileResourceResolver;

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
var resolver = new FileResourceResolver();

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
var transformedBundleNode = tansformer.transform(bundler, false);

// create an emitter
var emitter = new Emitter();

// kickstart the emitter; TODO: eliminate
emitter.startFreshLine();

// emit! this is what we have come all the way for!
emitter.emitStmt(transformedBundleNode);

// flush anything that might still be pending in the emitter
emitter.flushCurrentLine();

// YAY! SHOW IT TO THE WORLD!
console.log(emitter.out);

if (0) {
var exports = {};

console.log("BUILD STARTED");
builder.build();

console.log("<WRITING FIRST>");
builder.write(fs .openSync(dist+'.js', 'w+'));
console.log("<WRITING COMPLETE>");

console.log("TESTING.....");

try {
   new Function(builder.str).call(exports);
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
console.log("BUILDING COMPLETE.");
}
