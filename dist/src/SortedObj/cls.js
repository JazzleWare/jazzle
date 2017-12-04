  import {createObj} from '../other/util.js';

export default function SortedObj(obj) {
  this.keys = [];
  this.obj = obj || {};
}

 export var cls = SortedObj.prototype;
