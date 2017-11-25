  import Scope from '../Scope/cls.js';
  import {ST_PAREN} from '../other/scope-constants.js';

function ParenScope(sParent) {
  Scope.call(this, sParent, ST_PAREN);

  this.hasDissolved = false;
  this.ch = [];
}

 export {ParenScope};

 import {createObj} from '../other/util.js';
 export var cls = ParenScope.prototype = createObj(Scope.prototype);
