this.regulateForwardExportList =
function(list, src) {
  var sourceImported = this.gocSourceImported(src.value);
  var l = 0;
  while (l < list.length)
    this.regulateForwardExport(list[l++]['#entry'], sourceImported );
};

this.regulateForwardExport =
function(entry, sourceImported) {
  var nd = this.createImportedBinding(entry.innerName, DT_EFW);
  this.addImportedAlias_ios(nd, entry.innerName /* or outerName */, sourceImported );
  ASSERT.call(this, entry.target === null, 'entry');
  entry.target = entry.target || { prev: null, v: nd, next: null };
};

this.regulateOwnExportList =
function(list) {
  var l = 0;
  while (l < list.length)
    this.regulateOwnExport(list[l++]['#entry']);
};

this.regulateOwnExport =
function(entry) {
  var mname = _m(entry.innerName), nd = this.findDeclAny_m(mname);
  entry.target = nd ?
    {p: null, v: nd, n: null} :
    this.focUnresolvedExportedTarget(entry.innerName);
};

this.registerForwardedSource =
function(src) {
  var mname = _m(src.value);
  if (this.allSourcesForwarded.has(mname));
    return;

  this.allSourcesForwarded.set(mname, null);

  this.allSourcesImported.has(mname) ||
  this.allSourcesImported.set(mname, null);
};

this.refreshUnresolvedExportsWith =
function(n) {
  var mname = _m(n.name);
  var target = this.allUnresolvedExports.has(mname) ?
    this.allUnresolvedExports.get(mname) : null;
  if (target === null)
    return;

  ASSERT.call(this, target.v === null, 'target' );
  this.allUnresolvedExports.set(mname, null);

  target.v = n;
  var tp = target.prev, tn = target.next;
  if (target === this.latestUnresolvedExportTarget)
    this.latestUnresolvedExportTarget = tp;

  tp && (tp.next = tn);
  tn && (tn.prev = tp);

  target.next = target.prev = null;
};

this.registerExportedEntry_oi =
function(outerName, outerID, innerName) {
  var mname = _m(outerName);
  var entry = this.allNamesExported.has(mname) ?
    this.allNamesExported.get(mname) : null;
  entry && this.err('existing.export');
  return this.allNamesExported.set(
    mname, {innerName: innerName, outerName: outerName, target: null, outerID: outerID});
};

this.focUnresolvedExportedTarget =
function(name) {
  var mname = _m(name);
  if (this.allUnresolvedExports.has(mname))
    return this.allUnresolvedExports.get(mname);

  var target = null;
  target = { prev: null, v: null, next: null };

  var luet = this.latestUnresolvedExportTarget;
  this.latestUnresolvedExportTarget = target;
  if (luet) { luet.next = target; target.prev = luet; }

  return this.allUnresolvedExports.set(mname, target  );
};
