function FunScope(parent, type) {
  ConcreteScope.call(this, parent, type);

  this.argList = [];
  this.argMap = {};
  this.argRefs = new SortedObj();
  this.prologue = [];
  this.scopeName = null;
  this.firstNonSimple = 
  this.firstDup =
  this.firstEvalOrArguments = null;
  this.inBody = false;
  this.special = { _this: null, _arguments: null };

  this.refs = this.argRefs;
}
