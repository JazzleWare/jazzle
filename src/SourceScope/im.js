  import {_m} from '../other/scope-util.js';
  import SortedObj from '../SortedObj/cls.js';
  import Decl from '../Decl/cls.js';
  import {cls} from './ctor.js';

cls.regulateImports_sl =
function(src, list) {
  var sourceImported = this.gocSourceImported(src.value);
  var e = 0;
  while (e < list.length) {
    var item = list[e++], target = item['#decl'];
    this.addImportedAlias_ios(
      target,
      target.isIAliased() ? item.imported.name :
      target.isIDefault() ? '*default*' : '*', sourceImported
    );
  }
};

cls.addImportedAlias_ios =
function(inner, outer, sourceImported) {
  var aliases = this.gocAliasesImported(sourceImported, outer);
  aliases.push(inner);
};

cls.gocSourceImported =
function(src) {
  var mname = _m(src);
  var im = this.allSourcesImported.has(mname) ?
    this.allSourcesImported.get(mname) : null;

  return im || this.allSourcesImported.set(mname, new SortedObj());
};

cls.declareImportedName =
function(id, t) {
  var mname = _m(id.name);
  var existing = this.findDeclAny_m(mname);
  existing && this.err('existing.binding.for.import');

  var nd = this.createImportedBinding(id, t);
  nd.r(this.rocRefU_m(mname));
  this.insertDecl_m(mname, nd);
  this.refreshUnresolvedExportsWith(nd );

  return nd;
};

cls.gocAliasesImported =
function(sourceImported, outerName) {
  var mname = _m(outerName);
  return sourceImported.has(mname) ? 
    sourceImported.get(mname) :
    sourceImported.set(mname, []);
};

cls.createImportedBinding =
function(id, t) {
  var nd = new Decl()
  nd.t(t).s(id).n(id.name);
  return nd;
};


