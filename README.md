# [Try Online!](https://jazzleware.github.io/jazzle)

# Jazzle -- Dazzlingly Fast ECMAScript Transpiler

## Intro
Jazzle is a dazzingly fast, new transpiler for ECMAScript, making new features like destructuring (complex) assignments, classes, lexical variables, arrow functions, and template strings available in environments where they are not yet supported.

It uses a number of novel techniques to efficiently implement features not (efficiently, if at all) implemented in other transpilers, most notably temporal dead zones for lexical variables and super-bound this references.

Oh, and it is still about **2x as fast as babel** on early benchmarks.

Give it a try and you will be surprised!

## Quickstart:
installation:
```sh
npm install -g jazzle # you might need to be root (sudo) to use the -g flag
```

usage:
```js
var src = 'let [myCoolSource] = ((a=myCoolSource) => [a])();',
    jazzle = require('jazzle');

var result = jazzle.transform(src, {sourceType: 'module'});

var fs = require('fs');

fs.writeFileSync('output.js', result.code);
fs.writeFileSync('output.js.sourcemap', result.sourceMap);
```

***CLI is currently in the making, and will be up and running early next week; stay tuned!***
