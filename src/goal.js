  import './Actix/whole.js';
  import './AutoImex/whole.js';
  import './Bundler/whole.js';
  import './BundleScope/whole.js';
  import './CatchScope/whole.js';
  import './ClassScope/whole.js';
  import './Comments/whole.js';
  import './ConcreteScope/whole.js';
  import './Decl/whole.js';
  import './Emitter/whole.js';
  import './ErrorString/whole.js';
  import './FunScope/whole.js';
  import './GlobalScope/whole.js';
  import './LiquidGroup/whole.js';
  import './Liquid/whole.js';
  import './ParenScope/whole.js';
  import './Parser/whole.js';
  import './PathMan/whole.js';
  import './Ref/whole.js';
  import './ResourceResolver/whole.js';
  import './ScopeName/whole.js';
  import './Scope/whole.js';
  import './SortedObj/whole.js';
  import './SourceScope/whole.js';
  import './Template/whole.js';
  import './Transformer/whole.js';
  import './VirtualResourceResolver/whole.js';

  import Parser from './Parser/cls.js';
  import Emitter from './Emitter/cls.js';
  import Transformer from './Transformer/cls.js';
  import PathMan from './PathMan/cls.js';
  import AutoImex from './AutoImex/cls.js';
  import {EC_NONE} from './other/constants.js';
  import {vlq, makeAcceptor} from './other/util.js';
  import Scope from './Scope/cls.js';
  import FunScope from './FunScope/cls.js';
  import CatchScope from './CatchScope/cls.js';
  import GlobalScope from './GlobalScope/cls.js';
  import ConcreteScope from './ConcreteScope/cls.js';
  import BundleScope from './BundleScope/cls.js';
  import {
     ST_GLOBAL, ST_MODULE, ST_SCRIPT, ST_EXPR, ST_DECL,
     ST_OBJ, ST_FN, ST_CLS, ST_CLSMEM, ST_STATICMEM,
     ST_OBJMEM, ST_METH, ST_CTOR, ST_SETTER, ST_GETTER,
     ST_ARROW, ST_GEN, ST_ASYNC, ST_BLOCK, ST_BARE, ST_CATCH} from './other/scope-constants.js';
  import VirtualResourceResolver from './VirtualResourceResolver/cls.js';
  import Bundler from './Bundler/cls.js';
  import {renamer_incremental, renamer_minify} from './other/renamer.js';

  import ResourceResolver from './ResourceResolver/cls.js';
  import JZMap from './JZMap/cls.js';

(function(global, exporter) {
  if (typeof exports === 'object' && typeof module !== 'undefined')
    exporter(exports);
  else if (typeof define === 'function' && define.amd)
    define(['exports'], exporter);
  else
    exporter(global.jazzle = global.jazzle || {});
})(this, function exporter(exports) { 

  exports.parse = function(src, isModule ) {
    var newp = new Parser(src, isModule);
    return newp.parseProgram();
  };

  exports.Parser = Parser;  
// this.ErrorString = ErrorString;
// this.Template = Template;
  exports.Emitter = Emitter;

  exports.Transformer = Transformer;
// this.Scope = Scope;
// this.Hitmap = Hitmap;
// this.GlobalScope = GlobalScope;
  exports. PathMan = PathMan;

// this.Emitter2 = Emitter2;

  exports.AutoImex = AutoImex;

  exports.transpile = function(src, options) {
  var p = new Parser(src, options);
  return new Emitter().eA(
    new Transformer().tr(p.parseProgram()),
    EC_NONE,
    false).code ;
};

  exports.vlq = vlq;

  exports.Scope = Scope; 
  exports.FunScope = FunScope; 
  exports.CatchScope = CatchScope; 
  exports.GlobalScope = GlobalScope; 
  exports.ConcreteScope = ConcreteScope; 

  exports.BundleScope = BundleScope ;

  exports.ST_GLOBAL = 1,
  exports.ST_MODULE = ST_GLOBAL << 1,
  exports.ST_SCRIPT = ST_MODULE << 1,
  exports.ST_EXPR = ST_SCRIPT << 1,
  exports.ST_DECL = ST_EXPR << 1,
  exports.ST_OBJ = ST_DECL << 1,
  exports.ST_FN = ST_OBJ << 1,
  exports.ST_CLS = ST_FN << 1,
  exports.ST_CLSMEM = ST_CLS << 1,
  exports.ST_STATICMEM = ST_CLSMEM << 1,
  exports.ST_OBJMEM = ST_STATICMEM << 1,
  exports.ST_METH = ST_OBJMEM << 1,
  exports.ST_CTOR = ST_METH << 1,
  exports.ST_SETTER = ST_CTOR << 1,
  exports.ST_GETTER = ST_SETTER << 1,
  exports.ST_ACCESSOR = ST_GETTER|ST_SETTER,
  exports.ST_ARROW = ST_GETTER << 1,
  exports.ST_GEN = ST_ARROW << 1,
  exports.ST_ASYNC = ST_GEN << 1,
  exports.ST_BLOCK = ST_ASYNC << 1,
  exports.ST_BARE = ST_BLOCK << 1,
  exports.ST_CATCH = ST_BARE << 1,
  exports.ST_PAREN = ST_CATCH << 1,
  exports.ST_NONE = 0; 

  exports. VirtualResourceResolver = VirtualResourceResolver;
  exports. Bundler = Bundler;
  exports.ResourceResolver = ResourceResolver;

  exports.renamer_incremental = renamer_incremental;

  exports.renamer_minify = renamer_minify;

  exports.JZMap = JZMap;
});
