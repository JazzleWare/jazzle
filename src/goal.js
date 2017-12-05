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
  import VirtualResourceResolver from './VirtualResourceResolver/cls.js';
  import Bundler from './Bundler/cls.js';
  import {renamer_incremental, renamer_minify} from './other/renamer.js';
  import ResourceResolver from './ResourceResolver/cls.js';
  import FileResourceResolver from './FileResourceResolver/cls.js';
  import JZMap from './JZMap/cls.js';

  import {HAS, ASSERT} from './other/constants.js';

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
  exports.Emitter = Emitter;
  exports.Transformer = Transformer;
  exports.PathMan = PathMan;
  exports.AutoImex = AutoImex;
  exports.VirtualResourceResolver = VirtualResourceResolver;
  exports.Bundler = Bundler;
  exports.ResourceResolver = ResourceResolver;
  exports.FileResourceResolver = FileResourceResolver;
  exports.renamer_incremental = renamer_incremental;
  exports.renamer_minify = renamer_minify;

  exports.JZMap = JZMap;

  exports.transform =
  function transform(src, options) {
    var isScript = true, v = null;
    if (!options) options = {};

    if (HAS.call(options, 'sourceType')) {
      switch (v = options.sourceType) {
      case 'module':
        isScript = false;
        break;
      case 'script':
        isScript = true;
        break;
      default:
        throw new Error(
          'Unknown value for "sourceType": ('+v+')'
        );
      }
    }

    var minify = false;
    if (HAS.call(options, 'minify')) {
      v = options.minify;
      if (v === true || v === false)
        minify = v;
      else throw new Error(
        'Unknown value for "minify": ('+v+')'
      );
    }

    var bundleAll = false;
    var rootUri = "", resolver = null;
    if (HAS.call(options, 'bundle')) {
      v = options.bundle;
      if (v === true || v === false)
        bundleAll = v;
      else throw new Error(
        'Unknown value for "bundle": ('+v+')'
      );
    }

    if (bundleAll) {
      ASSERT.call(
        this, 
        HAS.call(options, 'rootUri') &&
        options.rootUri && options.rootUri !== "",
        'bundling requested but no "rootUri" found in the provided options'
      );
      rootUri = options.rootUri;

      ASSERT.call(
        this, 
        HAS.call(options, 'resolver') && options.resolver,
        'bundling requested but no "resolver" found in the provided options'
      );
      resolver = options.resolver;
    }

    var pathMan = null, bundler = null;
    if (bundleAll) {
      pathMan = new PathMan();
      bundler = new Bundler(pathMan);
      bundler.resolver = resolver;
      var rootHead = pathMan.head(rootUri);
      bundler.setURIAndDir(rootUri, rootHead);
      resolver.bundleScope = bundler.bundleScope;
    }

    var parser = new Parser(src, {sourceType: isScript ? 'script' : 'module'});

    if (bundler) {
      parser.bundler = bundler;
      parser.bundleScope = bundler.bundleScope;
    }

    var rootNode = parser.parseProgram();

    var transformer = new Transformer();
    if (minify)
      transformer.renamer = renamer_minify;

    var transformedNode = null;
    if (bundler) {
      bundler.rootNode = rootNode;
      transformedNode = transformer.tr(bundler, false);
    }
    else
      transformedNode = transformer.tr(rootNode, false);

    var emitter = new Emitter();

    if (minify) {
      var a = emitter.allow;
      a.space = a.nl = a.comments.l = a.comments.m = false;
    }

    emitter.allow.jzWrapper = true;

    emitter.start();
    emitter.emitStmt(transformedNode);
    emitter.flushAll();

    return {
      code: emitter.out,
      sourceMap: emitter.sm
    };
  }
});
