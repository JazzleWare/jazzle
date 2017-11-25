  import ConcreteScope from '../ConcreteScope/cls.js';
  import {ST_GLOBAL} from '../other/scope-constants.js';

function GlobalScope() {
  ConcreteScope.call(this, null, ST_GLOBAL);  
  this.scriptScope = null;
}


 export {GlobalScope};

 import {createObj} from '../other/util.js';
 export var cls = GlobalScope.prototype = createObj(ConcreteScope.prototype);
