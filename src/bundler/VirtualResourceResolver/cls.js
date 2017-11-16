 import ResourceResolver from '../ResourceResolver/cls.js';
 export default function VirtualResourceResolver(pathMan) {
   ResourceResolver.call(this, pathMan);
   this.fsMap = {};
 }
