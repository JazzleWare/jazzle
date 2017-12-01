 import ConcreteScope from '../ConcreteScope/cls.js';
 import {ST_BUNDLE} from '../other/scope-constants.js';

 export default function BundleScope() {
   ConcreteScope.call(this, null, ST_BUNDLE);
 }

 import {createObj} from '../other/util.js';
 export var cls = BundleScope.prototype = createObj(ConcreteScope.prototype);
