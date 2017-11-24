  import Scope from '../Scope/cls.js';
  import SortedObj from '../SortedObj/cls.js';

function ModuleScope(sParent, type) {
  Scope.call(this, sParent, type);

  this.inNames = new SortedObj();
  this.outNames = new SortedObj();
}

 export default ModuleScope;
 export var cls = ModuleScope.prototype = ;
