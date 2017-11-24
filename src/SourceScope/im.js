
this.regulateImports_sl =
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

this.addImportedAlias_ios =
function(inner, outer, sourceImported) {
  var aliases = this.gocAliasesImported(sourceImported, outer);
  aliases.push(inner);
};

this.gocSourceImported =
function(src) {
  var mname = _m(src);
  var im = this.allSourcesImported.has(mname) ?
    this.allSourcesImported.get(mname) : null;

  return im || this.allSourcesImported.set(mname, new SortedObj());
};

this.declareImportedName =
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

this.gocAliasesImported =
function(sourceImported, outerName) {
  var mname = _m(outerName);
  return sourceImported.has(mname) ? 
    sourceImported.get(mname) :
    sourceImported.set(mname, []);
};

this.createImportedBinding =
function(id, t) {
  var nd = new Decl()
  nd.t(t).s(id).n(id.name);
  return nd;
};

