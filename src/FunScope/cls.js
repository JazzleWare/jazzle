
// TODO: inBody makes the logic brittle
function FunScope(parent, type) {
  ConcreteScope.call(this, parent, type|ST_FN);

  this.argList = [];
  this.argMap = {};
  this.argRefs = new SortedObj();
  this.prologue = [];
  this.scopeName = null;
  this.firstNonSimple = 
  this.firstDup =
  this.firstEvalOrArguments = null;
  this.inBody = false;
  this.bodyRefs = new SortedObj();

  this.closureLLINOSA = null;

  this.refs = this.argRefs;

  this.spArguments = null;
  this.spSuperCall = null;

}

 export default FunScope;
 export var cls = FunScope.prototype = ;
