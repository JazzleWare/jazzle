  import ResourceResolver from '../ResourceResolver/cls.js';

function VirtualResourceResolver(pathMan) {
  ResourceResolver.call(this, pathMan);
  this.fsMap = {};
}

 export default VirtualResourceResolver;

 import {createObj} from '../other/util.js';
 export var cls = VirtualResourceResolver.prototype = createObj(ResourceResolver.prototype);
