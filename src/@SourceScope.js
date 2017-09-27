function SourceScope(parent, st) {
  ConcreteScope.call(this, parent, st);
  this.spThis = null;
  this.globals = new SortedObj();

  this.allSourcesImported = this.asi = new SortedObj();
  this.allNamesExported = this.ane = new SortedObj();
  this.allSourcesForwarded = this.asf = new SortedObj();

  this.latestUnresolvedExportTarget = null;
  this.allUnresolvedExports = this.aue = new SortedObj();
}
