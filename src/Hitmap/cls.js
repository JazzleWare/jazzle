  import SortedObj from '../SortedObj/cls.js';

function Hitmap() {
  var validNames = arguments.length ? new SortedObj({}) : null;
  var i = 0;
  while (i < arguments.length)
    validNames.set(arguments[i++], true);
  this.validNames = validNames;
  this.names = new SortedObj({});
}

 export default Hitmap;
 export var cls = Hitmap.prototype;
