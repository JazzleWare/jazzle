  import Scope from '../Scope/cls.js';
  import {ST_CATCH} from '../other/scope-constants.js';
  import SortedObj from '../SortedObj/cls.js';

function CatchScope(sParent) {
  Scope.call(this, sParent, ST_CATCH);

  this.args = new SortedObj();
  this.argRefs = new SortedObj();
  this.argIsSimple = false;
  this.argIsSignificant = false;
  this.inBody = false;
  this.bodyRefs = new SortedObj();

  this.refs = this.argRefs;

  this.catchVar = null;
  this.isBooted = false;
  
  this.synthNamesUntilNow = null;
  this.renamer = null;
}

 export default CatchScope;

 import {createObj} from '../other/util.js';
 export var cls = CatchScope.prototype = createObj(Scope.prototype);
