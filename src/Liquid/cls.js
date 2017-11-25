  import Decl from '../Decl/cls.js';
  import {DT_LIQUID} from '../other/scope-constants.js';

function Liquid(category) {
  Decl.call(this);
  this.type |= DT_LIQUID;
  this.category = category;
}

 export default Liquid;

 import {createObj} from '../other/util.js';
 export var cls = Liquid.prototype = createObj(Decl.prototype);
