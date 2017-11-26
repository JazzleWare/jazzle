  import Scope from '../Scope/cls.js';
  import {ST_CLS} from '../other/scope-constants.js';

export default function ClassScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_CLS);  
  this.scopeName = null;
}

 import {createObj} from '../other/util.js';
 export var cls = ClassScope.prototype = createObj(Scope.prototype);
