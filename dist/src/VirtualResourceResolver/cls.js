  import ResourceResolver from '../ResourceResolver/cls.js';

export default function VirtualResourceResolver(pathMan) {
  ResourceResolver.call(this, pathMan);
  this.fsMap = {};
}

 import {createObj} from '../other/util.js';
 export var cls = VirtualResourceResolver.prototype = createObj(ResourceResolver.prototype);
