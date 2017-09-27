function SourceScope(parent, st) {
  ConcreteScope.call(this, parent, st);
  this.spThis = null;
  this.globals = new SortedObj();

  this.allSourcesImported = this.asi = new SortedObj();
  this.allNamesExported = this.ane = new SortedObj();
  this.allSourcesForwarded = this.asf = new SortedObj();

  this.unresolvedExportsNum = 0;
  this.allUnresovedExports = this.aue = new SortedObj();
}
