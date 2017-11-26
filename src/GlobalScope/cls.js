  import ConcreteScope from '../ConcreteScope/cls.js';
  import {ST_GLOBAL} from '../other/scope-constants.js';

export default function GlobalScope() {
  ConcreteScope.call(this, null, ST_GLOBAL);  
  this.scriptScope = null;
}

 import {createObj} from '../other/util.js';
 export var cls = GlobalScope.prototype = createObj(ConcreteScope.prototype);
