  import SortedObj from '../SortedObj/cls.js';

export default function AutoImex() {
  this.Parser = null;
  this.Emitter = null;
  this.sources = new SortedObj();
  this.unresolvedNames = new SortedObj();
  this.bundleBindings = new SortedObj();
  this.clsUriList = {};
}

 export var cls = AutoImex.prototype;
