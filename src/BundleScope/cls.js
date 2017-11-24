  import ConcreteScope from '../ConcreteScope/cls.js';
  import {ST_BUNDLE} from '../other/scope-constants.js';

function BundleScope() { ConcreteScope.call(this, null, ST_BUNDLE); }

 export default BundleScope;
 export var cls = BundleScope.prototype = ;
