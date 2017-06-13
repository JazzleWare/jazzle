function SourceScope(parent, st) {
  Scope.call(this, parent, st);
  this.asMod = { e: new SortedObj(), i: new SortedObj(), f: new SortedObj() };
  this.spThis = null;
}
