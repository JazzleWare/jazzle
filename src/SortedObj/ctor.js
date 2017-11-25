  import {createObj} from '../other/util.js';

function SortedObj(obj) {
  this.keys = [];
  this.obj = obj || {};
}

SortedObj.from = function(parent) {
  return new SortedObj(createObj(parent.obj));
};

 export {SortedObj};
 export var cls = SortedObj.prototype;
