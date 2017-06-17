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

    m['#scope'].satisfyAll(mim.at(e), loni, bundler);

    bundler.path = oPath;
    e++;
  }

  return loni;
};

this.findSatisfierEntry_m =
function(mname, loni, bundler) {
  var entry = this.findExportedEntry_m(mname);
  if (entry === null) 
    entry = this.findInForwardEntries_m(mname);
  return entry;
};

this.satisfyAll =
function(list, bundler) {
  var mns = this.asMod.mns, e = 0, len = list.length();
  while (e < len) {
    var mname = list.keys[e];
    var entry = this.findExportedEntry_m(mname);
    if (entry === null)
      entry = this.findInForwardEntries_m(mname, bundler);
    if (entry === null)
      this.err('unsatisfied.import');
    var im = list.at(e);
    im === entry.target /* a.js: import {e as a} from './a.js'; export let e = 5; */ || im.referTo(entry.target);
    e++;
  }
};

this.findInForwardEntries_m =
function(mname, loni, bundler) {
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
      mns.set(mns.keys[e], satisfierNamespace );
    }
    var entry = satisfier
  }
};
