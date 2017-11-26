  import Decl from '../Decl/cls.js';
  import {DT_LIQUID} from '../other/scope-constants.js';

export default function Liquid(category) {
  Decl.call(this);
  this.type |= DT_LIQUID;
  this.category = category;
}

 import {createObj} from '../other/util.js';
 export var cls = Liquid.prototype = createObj(Decl.prototype);
