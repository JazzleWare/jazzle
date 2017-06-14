function SourceScope(parent, st) {
  Scope.call(this, parent, st);
  this.asMod = { mex: new SortedObj(), mim: new SortedObj(), mns: new SortedObj() };
  this.spThis = null;
}
