
function ConcreteScope(parent, type) {
  Scope.call(this, parent, type);

  this.liquidDefs = new SortedObj();
  this.synthNamesUntilNow = null;

  this.spThis = null;
  this.isBooted = false;

  this.renamer = null;
}

 export default ConcreteScope;
 export var cls = ConcreteScope.prototype = ;
