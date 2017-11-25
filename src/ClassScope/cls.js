  import Scope from '../Scope/cls.js';
  import {ST_CLS} from '../other/scope-constants.js';

function ClassScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_CLS);  
  this.scopeName = null;
}

 export default ClassScope;

 import {createObj} from '../other/util.js';
 export var cls = ClassScope.prototype = createObj(Scope.prototype);
