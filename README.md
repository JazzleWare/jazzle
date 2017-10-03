**THIS IS THE ACTIVE BRANCH UNTIL ~~THINGS ARE MIGRATED TO ROLLUP~~ THE BUNDLER GETS WORKING; ADAPTING CODE TO USE IMPORT/EXPORT STARTS AFTER GETTING THE SCRIPT-LEVEL EMITTER TO WORK**

# Basic Usage:
```js
// assuming you are in repo's root
var j = require('./dist/jazzle.js');
var src = 'var a, b, l = {a, [b]: {l}} = ({A}=a) => a = ({B=b}) => b = ({L=l}=40) => l';

// parse it
var syntaxNode = new j.Parser(src).parseProgram();

// transform what was parsed
var transformer = new j.Transformer();
var transformedNode = transformer.tr(syntaxNode, false);

// emit what was transformed
var emitter = new j.Emitter();
emitter.emitStmt(transformedNode);
emitter.flush(); // flush whatever output that is still pending

// the compiled code:
console.log(emitter.out);

// along with the produced sourcemap:
console.error(emitter.sm);

// helpers
// console.log(emitter.emitJFn());
```

**N.A.F.T.O.S [1]: this still work in progress; please check back in a month or so**

[1]: notice aimed at aliens from the outer space (mostly)
