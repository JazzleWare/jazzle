  import Decl from '../Decl/cls.js';

function ScopeName(name, src) {
  Decl.call(this);

  this.name = name;
  this.source = src;
}

 export default ScopeName;
 export var cls = ScopeName.prototype = ;
