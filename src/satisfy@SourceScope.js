this.satisfyWithBundler =
function(bundler) {
  var bundlerSources = bundler.freshSources;
  var allSourcesImported = this.allSourcesImported,
      e = 0, len = allSourcesImported.length();

  bundler.freshSources = [];

  while (e < len) {
    var sourcePath = _u(allSourcesImported.keys[e]);
    var exitPath = bundler.enter(sourcePath);
    var src = bundler.getExistingSourceNode() || bundler.loadNewSource();
    ASSERT.call(this, src, 'source not found: "'+sourcePath+'"' );

    var satisfierScope = src['#scope'];
    if (this.forwardsSource(sourcePath))
      this.fillForwardedSourceEntry(sourcePath, satisfierScope);

    var entriesImported = allSourcesImported.at(e);
    entriesImported && satisfierScope.satisfyEntries(entriesImported );

    bundler.setURIAndDir(exitPath.uri, exitPath.dir);
    e++;
  }

  var im = bundler.freshSources;
  bundler.freshSource = bundlerSources;

  return im;
};

this.satisfyEntries =
function(list) {
  var len = list.length(), l = 0;
  while (l < len) {
    var name = _u(list.keys[l]);
    var bindingList = list.at(l), bi = 0;
    while (bi < bindingList.length)
      this.satisfyBindingWithName(bindingList[bi++], name);
    l++;
  }
};

this.satisfyBindingWithName =
function(binding, name) {
  var ex = this.searchExports(name, null);

  ex || this.err('unresolved.name');
  this.resolve1to2(binding, ex.ref.getDecl());
};

this.searchInOwnExports =
function(name) {
  var mname = _m(name);
  var entry = this.allNamesExported.has(mname) ?
    this.allNamesExported.get(mname) : null;
  if (entry) {
    ASSERT.call(this, entry.target.v, 'entry' );
    return entry.target.v;
  }
  return null;
};

this.searchExports =
function(name, soFar) {
  var ex = this.searchInOwnExports(name);
  if (ex === null) {
    if (soFar === null) soFar = {};
    soFar[this.ai] = this;
    ex = this.searchInForwardedExports(name, soFar);
  } 
  return ex;
};

this.searchInForwardedExports =
function(name, soFar) {
  var list = this.allSourcesForwarded, l = 0, len = list.length();
  var entry = null
  while (l < len) {
    var satisfier = list.at(l++);
    if (!HAS.call(soFar, satisfier.ai)) {
      entry = satisfier.searchExports(name, soFar);
      if (entry) break;
    }
  }
  return entry;
};

this.resolve1to2 =
function(slave, master) {
  ASSERT.call(this, master === master.ref.getDecl(), 'master');
  ASSERT.call(this, master !== slave, 'same');

  var slaveRef = slave.ref;
  slaveRef.hasTarget = false;
  slaveRef.targetDecl = null;

  var slaveRSList = slaveRef.rsList, l = 0;
  if (master.rsMap === null)
    master.refreshRSListWithList(master.ref.rsList);

  master.refreshRSListWithList(slaveRef.rsList);
  master.refreshRSListWith(slaveRef.scope);

  ASSERT.call(this, slaveRef.parentRef === null, 'slaveRef');
  slaveRef.parentRef = master.ref;
};
