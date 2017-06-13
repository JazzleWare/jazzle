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
    this.asMod.i.has(mname) ?
      this.asMod.i.get(mname) :
      this.asMod.i.set(mname, new SortedObj());

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
    else {
      ASSERT.call(this, decl.ref.scope === this, 'scope');

      // import {a as a0} from './e'; // new decl: 'a0' (new)
      // import {a as a2} from './e'; // new decl: 'a2' (=a0)
      sp['#decl'] = im.get(mname);
      this.insertDecl_m(_m(decl.name), sp['#decl']); 
    }
  }
};
