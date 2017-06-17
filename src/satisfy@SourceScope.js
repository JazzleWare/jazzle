this.satisfyWith =
function(bundler) {
  var loni = [], e = 0; // list of new imports
  var mim = this.asMod.mim, m = null;
  var len = mim.length(), name = "";
  while (e < len) {
    name = _u(mim.keys[e]);
    var oPath = bundler.cd(pathFor(name));
    var curName = tailFor(name);
    if (bundler.has(curName))
      m = bundler.get(curName);
    else {
      m = bundler.load(curName);
      loni.push(m);
    }

    if (this.asMod.mns.has(_m(name)))
      this.asMod.mns.set(_m(name), m['#scope']);

    var im = mim.at(e);
    if (im === null)
      ASSERT.call(this, this.asMod.mns.has(_m(name)), 'if im is null there has to be an entry for it in mns');
    else
      m['#scope'].satisfyAll(this, mim.at(e), loni, bundler);

    bundler.path = oPath;
    e++;
  }

  return loni;
};

this.satisfyAll =
function(origin, list, loni, bundler) {
  var mns = this.asMod.mns, e = 0, len = list.length();
  while (e < len) {
    var mname = list.keys[e];
    var entry = this.findExportedEntry_m(mname);
    if (entry === null)
      entry = this.findInForwardEntries_m(origin, mname, loni, bundler);
    if (entry === null)
      this.err('unsatisfied.import');
    var im = list.at(e);
    im === entry.target /* a.js: import {e as a} from './a.js'; export let e = 5; */ || im.referTo(entry.target);
    e++;
  }
};

this.findInForwardEntries_m =
function(origin, mname, loni, bundler) {
  var mns = this.asMod.mns, e = 0, len = mns.length();
  while (e < len) {
    var satisfierNamespace = mns.at(e);
    if (satisfierNamespace === null) {
      var name = _u(mns.keys[e]);
      var oPath = bundler.cd(pathFor(name));
      var curName = tailFor(name)
      if (bundler.has(curName))
        satisfierNamespace = bundler.get(curName);
      else {
        satisfierNamespace = bundler.load(curName);
        loni.push(satisfierNamespace);
      }
      satisfierNamespace = satisfierNamespace['#scope'];
      mns.set(mns.keys[e], satisfierNamespace );
    }
    var entry = satisfierNamespace.findExportedEntry_m(mname);

    // a.js: export * from './a.js'; import {l} // will blow the stack if the satisfier scope is the same as the origin
    if (entry === null && origin !== satisfierNamespace)
      entry = satisfierNamespace.findInForwardEntries_m(origin, mname, loni, bundler);
    if (entry)
      return entry;
    e++;
  }
  return null;
};
