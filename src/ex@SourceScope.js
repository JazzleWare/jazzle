this.regulateExports_sl =
function(list) {
  var l = 0;
  while (l < list.length) {
    var entry = list[l++]['#entry'], mname = _m(entry.name);
    var n = this.findDeclAny_m(mname);
    if (n === null)
      this.registerUnresolvedExportedEntry_m(mname, entry);
    else
      entry.target = n;
  }
};

this.refreshUnresolvedExportsWith =
function(nd) {
  var mname = _m(nd.name);
  var entry = this.allUnresolvedExports.has(mname) ?
    this.allUnresolvedExports.get(mname) : null;
  if (entry === null)
    return;
  ASSERT.call(this, entry.target === null, 'entry');

  this.allUnresolvedExports.set(mname, null);
  entry.target = nd;

  var en = entry.next, ep = entry.prev;
  if (entry === this.latestUnresolvedExport)
    this.latestUnresolvedExport = ep;

  if(ep) 
    ep.next = en;
  if(en)
    en.prev = ep;
};

this.registerForwardedSource =
function(src) {
  var mname = _m(src.value);
  if (this.allSourcesForwarded.has(mname))
    return;
  this.allSourcesForwarded.set(mname, null);
  this.asi.has(mname) || this.asi.set(mname, null);
};

this.registerExportedEntry_ioe = 
function(inner, outer, entryMap) {
  var mnameOuter = _m(outer);
  var entry = this.allNamesExported.has(mnameOuter) ?
    this.allNamesExported.get(mnameOuter) : null;
  entry && this.err('existing.export');

  var mnameInner = _m(inner);
  if (HAS.call(entryMap, mnameInner))
    entry = entryMap[mnameInner];
  else
    entry = entryMap[mnameInner] =
      { id: null, target: null, next: null, prev: null, inner: inner };

  return this.allNamesExported.set(mname, entry);
};

this.registerUnresolvedExportedEntry_m =
function(mname, entry) {
  ASSERT.call(this, !this.allUnresolvedExports.has(mname), 'existing unresolved');
  this.allUnresolvedExports.set(mname, entry);
  var lue = this.lastUnresolvedExport;
  this.lastUnresolvedExport = entry;
  if (lue) { lue.next = entry; entry.prev = lue; }
};

this.regulateForwards_sl =
function(src, list) {
  var sourceImported = this.gocSourceImported(src.value), l = 0;
  while (l < list.length) {
    var item = list[l++], entry = item['#entry'];
    entry.target = this.createImportedBinding(item.exported, DT_EFW).r(new Ref(this)); 
    this.addImportedAlias_ios(entry.target, item.local.name, sourceImported );
  }
};


