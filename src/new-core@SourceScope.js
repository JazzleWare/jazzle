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
  var im = 
    this.asMod.mim.has(mname) ?
      this.asMod.mim.get(mname) :
      this.asMod.mim.set(mname, new SortedObj());

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
      // a; import {a} from 'e'
      // b; import {a as b} from 'e'
      var existing = im.get(mname);
      decl.ref.cut();
      existing.ref.updateRSList(decl.ref);
      decl.ref = existing.ref;
    }
  }
};
