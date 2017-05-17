# jazzle

An ECMAScript7-to-ECMAScript5/ECMAScript3 transpiler

**NOTE PLEASE** , that this is a work in progress. The parser is now working (it has been Ruined five times, and Created anew five times, so feel free to give it credit, for there well is a chance it gets Ruined overnight) and you can use It like so (assuming you are in the repo's root):

```js
var jazzle = require('./dist/jazzle.js');
var t = new jazzle.Parser(
  'your(code)',
  {ecmaVersion: 8, sourceType: 'module' } // options, if any
);
var n = t.parseProgram();
```

The Emitter and the Transformer actually used to work and do well, but I'm currently busy Ruining them too; only that they have not been as lucky as their sibling to get back to life fast.

It is going to have a very simple TZ checker (this _is_ a _very_ simple thing -- and who gets disappointed, other than those who believe to know every thing), its own lexical variable emission mechanism (radically different from Traceur the Ancient, which is the one all others are currently copying from) and its own generator transformer (and what it produces is a non-intrusively transformed source which has a strikingly close resemblance to its original, at least much more so than regenerator, for that matter.)

This of course might sound a far-reaching utopian device the like of those the Communists wanted to make back when they thought they have reached humanity's holy grail, but please take a look at the previous commits before believing your guesses.

You are free stay patient; in which case, your patience will be much appreciated.

# Build
building is somewhat easy; first you should of course clone this repo (if you have not yet):
```sh
git clone https://github.com/JazzleWare/jazzle
```

then you should cd to `jazzle` (or any other directory you cloned the repo into), and call the build script
```sh
 node ./builder/run.js
```
this bundles all the sources in `src` into `dist/jazzle.js`; an example on how to use the bundle when it has been built has been given uptop.
