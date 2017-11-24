  import Parser from '../Parser/cls.js';
  import Emitter from '../Emitter/cls.js';
  import Transformer from '../Transformer/cls.js';
  import PathMan from '../PathMan/cls.js';
  import AutoImex from '../AutoImex/cls.js';
  import {EC_NONE} from './constants.js';
  import {vlq, makeAcceptor} from './util.js';
  import Scope from '../Scope/cls.js';
  import FunScope from '../FunScope/cls.js';
  import CatchScope from '../CatchScope/cls.js';
  import GlobalScope from '../GlobalScope/cls.js';
  import ConcreteScope from '../ConcreteScope/cls.js';
  import BundleScope from '../BundleScope/cls.js';
  import {ST_GLOBAL, ST_MODULE, ST_SCRIPT, ST_EXPR, ST_DECL, ST_OBJ, ST_FN, ST_CLS, ST_CLSMEM, ST_STATICMEM, ST_OBJMEM, ST_METH, ST_CTOR, ST_SETTER, ST_GETTER, ST_ARROW, ST_GEN, ST_ASYNC, ST_BLOCK, ST_BARE, ST_CATCH} from './scope-constants.js';
  import VirtualResourceResolver from '../VirtualResourceResolver/cls.js';
  import Bundler from '../Bundler/cls.js';
  import {renamer_incremental, renamer_minify} from './renamer.js';

this.parse = function(src, isModule ) {
  var newp = new Parser(src, isModule);
  return newp.parseProgram();
};

this.Parser = Parser;  
// this.ErrorString = ErrorString;
// this.Template = Template;
this.Emitter = Emitter;

this.Transformer = Transformer;
// this.Scope = Scope;
// this.Hitmap = Hitmap;
// this.GlobalScope = GlobalScope;
 this. PathMan = PathMan;

// this.Emitter2 = Emitter2;

this.AutoImex = AutoImex;

this.transpile = function(src, options) {
  var p = new Parser(src, options);
  return new Emitter().eA(
    new Transformer().tr(p.parseProgram()),
    EC_NONE,
    false).code ;
};

this.vlq = vlq;

this.Scope = Scope; 
this.FunScope = FunScope; 
this.CatchScope = CatchScope; 
this.GlobalScope = GlobalScope; 
this.ConcreteScope = ConcreteScope; 

this.BundleScope = BundleScope ;

this.ST_GLOBAL = 1,
this.ST_MODULE = ST_GLOBAL << 1,
this.ST_SCRIPT = ST_MODULE << 1,
this.ST_EXPR = ST_SCRIPT << 1,
this.ST_DECL = ST_EXPR << 1,
this.ST_OBJ = ST_DECL << 1,
this.ST_FN = ST_OBJ << 1,
this.ST_CLS = ST_FN << 1,
this.ST_CLSMEM = ST_CLS << 1,
this.ST_STATICMEM = ST_CLSMEM << 1,
this.ST_OBJMEM = ST_STATICMEM << 1,
this.ST_METH = ST_OBJMEM << 1,
this.ST_CTOR = ST_METH << 1,
this.ST_SETTER = ST_CTOR << 1,
this.ST_GETTER = ST_SETTER << 1,
this.ST_ACCESSOR = ST_GETTER|ST_SETTER,
this.ST_ARROW = ST_GETTER << 1,
this.ST_GEN = ST_ARROW << 1,
this.ST_ASYNC = ST_GEN << 1,
this.ST_BLOCK = ST_ASYNC << 1,
this.ST_BARE = ST_BLOCK << 1,
this.ST_CATCH = ST_BARE << 1,
this.ST_PAREN = ST_CATCH << 1,
this.ST_NONE = 0; 

this. VirtualResourceResolver = VirtualResourceResolver;
this. Bundler = Bundler;

this. makeAcceptor = makeAcceptor;

// this.cd = cd;
// this.pathFor = pathFor;
// this.tailFor = tailFor;

this.renamer_incremental = renamer_incremental;
this.renamer_minify = renamer_minify;
