function SourceScope(parent, st) {
  ConcreteScope.call(this, parent, st);
  this.asMod = { mex: new SortedObj(), mim: new SortedObj(), mns: new SortedObj() };
  this.unresolvedExports = { entries: new SortedObj(), count: 0 };
  this.spThis = null;
  this.globals = new SortedObj();
}
