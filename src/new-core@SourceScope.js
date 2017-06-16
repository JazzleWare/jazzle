this.declareImportedName =
function(id, t) {
  ASSERT.call(this, (t & DT_IMPORTED), 'not im');
  var mname = _m(id.name);
  var decl = this.declareLexical_m(mname, t);
  return decl.s(id );
};

this.trackImports =
function(src, list) {
  // TODO: src might have to get a normalization
  var mname = _m(src);
  var im = this.asMod.mim.has(mname) ?
    this.asMod.mim.get(mname) : null;

  if (im === null)
    im = this.asMod.mim.set(mname, new SortedObj());

  var e = 0;

  while (e < list.length) {
    var sp = list[e++], decl = sp['#decl'];
    mname = _m(
      decl.isIDefault() ? '*default*' :
      decl.isIAliased() ? sp.imported.name :
      (ASSERT.call(this, decl.isINamespace(), 'namespace'), '*')
    ); 

    if (!im.has(mname))
      im.set(mname, decl);
    else if (im.get(mname) !== null) { // if it is not just a forwarded name (i.e., an `export ... from ...`)
      ASSERT.call(this, decl.ref.scope === this, 'scope');
      // a;
      // import {a} from 'e'
      // b;
      // import {a as b} from 'e'
      var existing = im.get(mname);
      decl.referTo(existing);
    }
  }
};

this.attachExportedEntry =
function(name) {
  var mname = _m(name);
  var entry = this.findExportedEntry_m(mname);
  if (entry)
    this.parser.err('existing.export');
  entry = {site: null, target: null, value: null};
  this.insertExportedEntry_m(mname, entry);
  return entry;
};

this.insertExportedEntry_m =
function(mname, entry) {
  return this.asMod.mex.set(mname, entry);
};

this.findExportedEntry_m =
function(mname) {
  var ex = this.asMod.mex;
  return ex.has(mname) ? ex.get(mname) : null;
};

this.attachFWNamespace =
function(src) {
  var mns = this.asMod.mns;
  var mname = _m(src);
  mns.has(mname) || mns.set(mname, null);
  if (!this.asMod.mim.has(mname))
    this.asMod.mim.set(mname, null);
};

this.trackExports = 
function(src, list) {
  var isFW = src.length > 0, e = 0;
  while (e < list.length) {
    var sp = list[e++], mname = _m(sp.local.name), entry = sp['#entry'];
    var target = isFW ?
      this.gocImportedName(src, sp.local) :
      this.findDeclAny_m(mname);
    if (target === null)
      this.insertUnresolvedExportedEntry_m(mname, entry);
    else
      entry.target = target;
  }
};

this.gocImportedName =
function(src, id) {
  var mname = _m(src), im = this.asMod.mim;
  im = im.has(mname) ? im.get(mname) : im.set(mname, new SortedObj());
  mname = _m(id.name);
  if (im.has(mname))
    return im.get(mname);
  var nd = new Decl().t(DT_EALIASED).n(id.name).s(id).r(new Ref(this));
  return im.set(mname, nd );
};

this.insertUnresolvedExportedEntry_m =
function(mname, entry) {
  this.unresolvedExports.entries.set(mname, entry);
  this.unresolvedExports.count++;
};

this.findUnresolvedExportedEntry_m =
function(mname) {
  var uentries = this.unresolvedExports.entries;
  return uentries.has(mname) ? uentries.get(mname) : null;
};
