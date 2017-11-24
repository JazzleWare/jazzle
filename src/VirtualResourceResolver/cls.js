  import ResourceResolver from '../ResourceResolver/cls.js';

function VirtualResourceResolver(pathMan) {
  ResourceResolver.call(this, pathMan);
  this.fsMap = {};
}

 export default VirtualResourceResolver;
 export var cls = VirtualResourceResolver.prototype = ;
